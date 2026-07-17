import { CommentDto, CreatePollDto, PollDetailsDto, PollListingDto } from "@/dto/poll.dtos";
import pool from "@/lib/db";
import { AppError } from "@/lib/error";
import { PagedResponse } from "@/types/common.types";
import { DEFAULT_PAGE_LIMIT } from "@/types/constants";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";
import { createNotification } from "./notification.service";

type Vote = 1 | -1;

type ReactionRow = RowDataPacket & {
    vote: Vote;
};

//delete this in prod 
const delay = () => new Promise((resolve) => setTimeout(() => resolve('intentional delay'), 1000));

function validateVote(vote: number): asserts vote is Vote {
    if (vote !== 1 && vote !== -1) {
        throw new Error("Invalid vote");
    }
}


export async function getPolls(
    userId: number | null,
    page: number = 1,
    limit: number = DEFAULT_PAGE_LIMIT,
    feedType: "for_you" | "following" = "for_you",
    topicId?: number | null,
    sortBy: "latest" | "top" = "top"
): Promise<PagedResponse<PollListingDto>> {

    page = Math.max(1, page);
    limit = Math.min(50, limit);
    const offset = (page - 1) * limit;

    // =========================
    // FILTERS
    // =========================
    const conditions: string[] = [];
    const filterParams: any[] = [];
    let joinTopic = "";

    if (topicId) {
        joinTopic = "INNER JOIN poll_topics pt ON pt.poll_id = p.id";
        conditions.push("pt.topic_id = ?");
        filterParams.push(topicId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // =========================
    // SCORES
    // =========================

    const forYouScore = `
    (
    LOG10(GREATEST(p.total_votes, 1)) * 5 +
    ((p.upvotes - p.downvotes) / GREATEST(p.total_votes, 1)) * 8 +
    (1 / POW((TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2), 1.3)) * 10
    )
    `;

    const getOrderBy = (hasScore: boolean) => {
        if (sortBy === "latest") {
            return "p.created_at DESC";
        }

        return hasScore
            ? "score DESC, p.created_at DESC"
            : "p.created_at DESC";
    };

    // =========================
    // BASE QUERY
    // =========================
    let baseQuery = "";
    let params: any[] = [];

    // FOLLOWING
    if (feedType === "following" && userId) {
        baseQuery = `
        SELECT DISTINCT p.*
        FROM polls p
        ${joinTopic}
        INNER JOIN user_follows uf
            ON p.created_by = uf.following_id
        WHERE uf.follower_id = ?
        ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
        ORDER BY ${getOrderBy(false)}
        LIMIT ? OFFSET ?
    `;

        params = [userId, ...filterParams, limit, offset];
    }



    // FOR YOU
    else {

        if (sortBy === "latest") {

            baseQuery = `
            SELECT DISTINCT p.*
            FROM polls p
            ${joinTopic}
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        } else {

            baseQuery = `
            SELECT DISTINCT
                p.*,
                ${forYouScore} AS score
            FROM polls p
            ${joinTopic}
            ${whereClause}
            ORDER BY score DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        }

        params = [...filterParams, limit, offset];
    }




    // =========================
    // MAIN QUERY
    // =========================
    const dataSql = `
    SELECT
      p.id AS poll_id,
      p.title,
      p.content,
      p.total_votes,
      p.upvotes,
      p.downvotes,
      p.created_at,

      u.followers_count,
      u.following_count,
      uf.following_id AS is_following,
      pr.vote AS user_reaction,

      u.id AS user_id,
      u.name,
      u.user_name,
      u.image,

      po.id AS option_id,
      po.option_text,
      po.vote_count,

      pv.option_id AS user_voted_option_id,

      oc.id AS user_reason_id,
      oc.comment AS user_reason

    FROM (${baseQuery}) p

    INNER JOIN users u ON p.created_by = u.id
    LEFT JOIN poll_options po ON po.poll_id = p.id

    LEFT JOIN poll_votes pv
      ON pv.poll_id = p.id AND pv.user_id = ?

    LEFT JOIN poll_reactions pr
      ON pr.poll_id = p.id AND pr.user_id = ?

    LEFT JOIN user_follows uf
      ON uf.following_id = u.id AND uf.follower_id = ?

    LEFT JOIN option_comments oc
      ON oc.option_id = pv.option_id AND oc.user_id = ?
  `;

    // =========================
    // COUNT QUERY
    // =========================
    let countSql = "";
    let countParams: any[] = [];

    if (feedType === "following" && userId) {

        countSql = `
        SELECT COUNT(DISTINCT p.id) AS total
        FROM polls p
        ${joinTopic}
        INNER JOIN user_follows uf
            ON p.created_by = uf.following_id
        WHERE uf.follower_id = ?
        ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
    `;

        countParams = [userId, ...filterParams];

    } else {

        countSql = `
        SELECT COUNT(DISTINCT p.id) AS total
        FROM polls p
        ${joinTopic}
        ${whereClause}
    `;

        countParams = filterParams;
    }

    // =========================
    // EXECUTE
    // =========================
    const [[rows], [countResult]]: any = await Promise.all([
        pool.query(dataSql, [...params, userId, userId, userId, userId]),
        pool.query(countSql, countParams),
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // =========================
    // GROUP
    // =========================
    const pollMap = new Map<number, PollListingDto>();

    for (const row of rows) {
        if (!pollMap.has(row.poll_id)) {
            pollMap.set(row.poll_id, {
                pollId: row.poll_id,
                title: row.title,
                content: row.content,
                totalVotes: row.total_votes,
                upvotes: row.upvotes,
                downvotes: row.downvotes,
                userReaction: userId ? row.user_reaction ?? null : null,
                createdAt: new Date(row.created_at).toISOString(),

                hasVoted: userId ? row.user_voted_option_id != null : false,
                userVoteOptionId: row.user_voted_option_id || null,

                hasReason: userId
                    ? row.user_voted_option_id && row.user_reason_id
                    : false,

                userReasonId: row.user_reason_id ?? null,
                userReason: row.user_reason ?? null,

                options: [],
                user: {
                    id: row.user_id,
                    name: row.name,
                    userName: row.user_name,
                    image: row.image,
                    followersCount: row.followers_count,
                    followingCount: row.following_count,
                    isFollowing: userId ? row.is_following != null : false,
                },
            });
        }

        if (row.option_id) {
            const poll = pollMap.get(row.poll_id)!;

            if (!poll.options.some(o => o.id === row.option_id)) {
                poll.options.push({
                    id: row.option_id,
                    optionText: row.option_text,
                    voteCount: row.vote_count,
                });
            }
        }
    }

    return {
        data: Array.from(pollMap.values()),
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

export async function getTrendingPolls(userId: number | null, limit: number = 6): Promise<PollListingDto[]> {

    const trendingScore = `
    (
        LOG10(GREATEST(p.total_votes, 1)) * 4 +
        ((p.upvotes - p.downvotes) / GREATEST(p.total_votes, 1)) * 6 +
        (p.total_votes / GREATEST(TIMESTAMPDIFF(HOUR, p.created_at, NOW()), 1)) * 5
    )
    `;

    const sql = `
        SELECT
            p.id AS poll_id,
            p.title,
            p.content,
            p.total_votes,
            p.upvotes,
            p.downvotes,
            p.created_at,

            u.followers_count,
            u.following_count,

            uf.following_id AS is_following,

            pr.vote AS user_reaction,

            u.id AS user_id,
            u.name,
            u.user_name,
            u.image,

            po.id AS option_id,
            po.option_text,
            po.vote_count,

            pv.option_id AS user_voted_option_id,

            oc.id AS user_reason_id,
            oc.comment AS user_reason

        FROM (

            SELECT
                p.*,
                ${trendingScore} AS score
            FROM polls p
            WHERE p.created_at >= NOW() - INTERVAL 7 DAY
            ORDER BY score DESC
            LIMIT ?

        ) p

        INNER JOIN users u
            ON u.id = p.created_by

        LEFT JOIN poll_options po
            ON po.poll_id = p.id

        LEFT JOIN poll_votes pv
            ON pv.poll_id = p.id
        AND pv.user_id = ?

        LEFT JOIN poll_reactions pr
            ON pr.poll_id = p.id
        AND pr.user_id = ?

        LEFT JOIN user_follows uf
            ON uf.following_id = u.id
        AND uf.follower_id = ?

        LEFT JOIN option_comments oc
            ON oc.option_id = pv.option_id
        AND oc.user_id = ?
        `;

    const [rows]: any = await pool.query(sql, [
        limit,
        userId,
        userId,
        userId,
        userId
    ]);

    const pollMap = new Map<number, PollListingDto>();

    for (const row of rows) {

        if (!pollMap.has(row.poll_id)) {

            pollMap.set(row.poll_id, {
                pollId: row.poll_id,
                title: row.title,
                content: row.content,
                totalVotes: row.total_votes,
                upvotes: row.upvotes,
                downvotes: row.downvotes,

                userReaction: userId
                    ? row.user_reaction ?? null
                    : null,

                createdAt: new Date(row.created_at).toISOString(),

                hasVoted: userId
                    ? row.user_voted_option_id != null
                    : false,

                userVoteOptionId:
                    row.user_voted_option_id || null,

                hasReason: userId
                    ? row.user_voted_option_id &&
                    row.user_reason_id
                    : false,

                userReasonId: row.user_reason_id ?? null,
                userReason: row.user_reason ?? null,

                options: [],

                user: {
                    id: row.user_id,
                    name: row.name,
                    userName: row.user_name,
                    image: row.image,
                    followersCount: row.followers_count,
                    followingCount: row.following_count,
                    isFollowing: userId
                        ? row.is_following != null
                        : false,
                },
            });
        }

        if (row.option_id) {

            const poll = pollMap.get(row.poll_id)!;

            if (!poll.options.some(o => o.id === row.option_id)) {

                poll.options.push({
                    id: row.option_id,
                    optionText: row.option_text,
                    voteCount: row.vote_count,
                });
            }
        }
    }

    return Array.from(pollMap.values());
}




// export async function getPolls(
//     userId: number | null,
//     page: number = 1,
//     limit: number = DEFAULT_PAGE_LIMIT,
//     feedType: "for_you" | "following" | "trending" = "for_you",
//     categoryId?: number | null,
//     topicIds?: number[] | null,
//     sortBy: "latest" | "top" = "top"
// ): Promise<PagedResponse<PollListingDto>> {

//     page = Math.max(1, page);
//     limit = Math.min(50, limit);
//     const offset = (page - 1) * limit;

//     // =========================
//     // FILTERS
//     // =========================
//     const conditions: string[] = [];
//     const filterParams: any[] = [];
//     let joinTopic = "";

//     if (categoryId) {
//         conditions.push("p.category_id = ?");
//         filterParams.push(categoryId);
//     }

//     if (topicIds?.length) {
//         joinTopic = "INNER JOIN poll_topics pt ON pt.poll_id = p.id";
//         conditions.push(`pt.topic_id IN (${topicIds.map(() => "?").join(",")})`);
//         filterParams.push(...topicIds);
//     }

//     const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

//     // =========================
//     // SCORES
//     // =========================
//     const trendingScore = `
//     (
//       LOG10(GREATEST(p.total_votes, 1)) * 2 +
//       ((p.upvotes - p.downvotes) / GREATEST(p.total_votes, 1)) * 4 +
//       (1 / POW((TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2), 1.8)) * 80 +
//       (p.total_votes / GREATEST(TIMESTAMPDIFF(HOUR, p.created_at, NOW()), 1)) * 3
//     )
//   `;

//     const forYouScore = `
//     (
//       LOG10(GREATEST(p.total_votes, 1)) * 3 +
//       ((p.upvotes - p.downvotes) / GREATEST(p.total_votes, 1)) * 5 +
//       (1 / POW((TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2), 1.3)) * 30 +
//       (p.total_votes / GREATEST(TIMESTAMPDIFF(HOUR, p.created_at, NOW()), 1)) * 1.5
//     )
//   `;

//     // ✅ ORDER BY logic
//     const getOrderBy = (hasScore: boolean) => {
//         if (sortBy === "latest") return "p.created_at DESC";
//         return hasScore ? "score DESC" : "p.created_at DESC";
//     };

//     // =========================
//     // BASE QUERY
//     // =========================
//     let baseQuery = "";
//     let params: any[] = [];

//     // ✅ FOLLOWING
//     if (feedType === "following" && userId) {
//         baseQuery = `
//       SELECT p.*
//       FROM polls p
//       ${joinTopic}
//       INNER JOIN user_follows uf 
//         ON p.created_by = uf.following_id
//       WHERE uf.follower_id = ?
//       ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
//       ORDER BY ${getOrderBy(false)}
//       LIMIT ? OFFSET ?
//     `;
//         params = [userId, ...filterParams, limit, offset];
//     }

//     // ✅ TRENDING
//     else if (feedType === "trending") {

//         if (sortBy === "latest") {
//             baseQuery = `
//         SELECT p.*
//         FROM polls p
//         ${joinTopic}
//         ${whereClause ? whereClause + " AND " : "WHERE"}
//         p.created_at >= NOW() - INTERVAL 48 HOUR
//         ORDER BY p.created_at DESC
//         LIMIT ? OFFSET ?
//       `;
//         } else {
//             baseQuery = `
//         SELECT p.*, ${trendingScore} AS score
//         FROM polls p
//         ${joinTopic}
//         ${whereClause ? whereClause + " AND " : "WHERE"}
//         p.created_at >= NOW() - INTERVAL 48 HOUR
//         GROUP BY p.id
//         ORDER BY score DESC
//         LIMIT ? OFFSET ?
//       `;
//         }

//         params = [...filterParams, limit, offset];
//     }

//     // ✅ FOR YOU
//     else {

//         if (sortBy === "latest") {
//             baseQuery = `
//         SELECT p.*
//         FROM polls p
//         ${joinTopic}
//         ${whereClause}
//         ORDER BY p.created_at DESC
//         LIMIT ? OFFSET ?
//       `;
//         } else {
//             baseQuery = `
//         SELECT p.*, ${forYouScore} AS score
//         FROM polls p
//         ${joinTopic}
//         ${whereClause}
//         GROUP BY p.id
//         ORDER BY score DESC
//         LIMIT ? OFFSET ?
//       `;
//         }

//         params = [...filterParams, limit, offset];
//     }

//     // =========================
//     // MAIN QUERY
//     // =========================
//     const dataSql = `
//     SELECT
//       p.id AS poll_id,
//       p.title,
//       p.content,
//       p.total_votes,
//       p.upvotes,
//       p.downvotes,
//       p.created_at,

//       u.followers_count,
//       u.following_count,
//       uf.following_id AS is_following,
//       pr.vote AS user_reaction,

//       u.id AS user_id,
//       u.name,
//       u.user_name,
//       u.image,

//       po.id AS option_id,
//       po.option_text,
//       po.vote_count,

//       pv.option_id AS user_voted_option_id,

//       oc.id AS user_reason_id,
//       oc.comment AS user_reason

//     FROM (${baseQuery}) p

//     INNER JOIN users u ON p.created_by = u.id
//     LEFT JOIN poll_options po ON po.poll_id = p.id

//     LEFT JOIN poll_votes pv
//       ON pv.poll_id = p.id AND pv.user_id = ?

//     LEFT JOIN poll_reactions pr
//       ON pr.poll_id = p.id AND pr.user_id = ?

//     LEFT JOIN user_follows uf
//       ON uf.following_id = u.id AND uf.follower_id = ?

//     LEFT JOIN option_comments oc
//       ON oc.option_id = pv.option_id AND oc.user_id = ?
//   `;

//     // =========================
//     // COUNT QUERY
//     // =========================
//     let countSql = "";
//     let countParams: any[] = [];

//     if (feedType === "following" && userId) {
//         countSql = `
//       SELECT COUNT(DISTINCT p.id) AS total
//       FROM polls p
//       ${joinTopic}
//       INNER JOIN user_follows uf 
//         ON p.created_by = uf.following_id
//       WHERE uf.follower_id = ?
//       ${conditions.length ? "AND " + conditions.join(" AND ") : ""}
//     `;
//         countParams = [userId, ...filterParams];
//     } else {
//         countSql = `
//       SELECT COUNT(DISTINCT p.id) AS total
//       FROM polls p
//       ${joinTopic}
//       ${whereClause}
//     `;
//         countParams = filterParams;
//     }

//     // =========================
//     // EXECUTE
//     // =========================
//     const [[rows], [countResult]]: any = await Promise.all([
//         pool.query(dataSql, [...params, userId, userId, userId, userId]),
//         pool.query(countSql, countParams),
//     ]);

//     const total = countResult[0].total;
//     const totalPages = Math.ceil(total / limit);

//     // =========================
//     // GROUP
//     // =========================
//     const pollMap = new Map<number, PollListingDto>();

//     for (const row of rows) {
//         if (!pollMap.has(row.poll_id)) {
//             pollMap.set(row.poll_id, {
//                 pollId: row.poll_id,
//                 title: row.title,
//                 content: row.content,
//                 totalVotes: row.total_votes,
//                 upvotes: row.upvotes,
//                 downvotes: row.downvotes,
//                 userReaction: userId ? row.user_reaction ?? null : null,
//                 createdAt: new Date(row.created_at).toISOString(),

//                 hasVoted: userId ? row.user_voted_option_id != null : false,
//                 userVoteOptionId: row.user_voted_option_id || null,

//                 hasReason: userId
//                     ? row.user_voted_option_id && row.user_reason_id
//                     : false,

//                 userReasonId: row.user_reason_id ?? null,
//                 userReason: row.user_reason ?? null,

//                 options: [],
//                 user: {
//                     id: row.user_id,
//                     name: row.name,
//                     userName: row.user_name,
//                     image: row.image,
//                     followersCount: row.followers_count,
//                     followingCount: row.following_count,
//                     isFollowing: userId ? row.is_following != null : false,
//                 },
//             });
//         }

//         if (row.option_id) {
//             const poll = pollMap.get(row.poll_id)!;

//             if (!poll.options.some(o => o.id === row.option_id)) {
//                 poll.options.push({
//                     id: row.option_id,
//                     optionText: row.option_text,
//                     voteCount: row.vote_count,
//                 });
//             }
//         }
//     }

//     return {
//         data: Array.from(pollMap.values()),
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//     };
// }





export async function searchPolls(
    userId: number | null,
    search: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_LIMIT
): Promise<PagedResponse<PollListingDto>> {

    page = Math.max(1, page);
    limit = Math.min(50, limit);

    const offset = (page - 1) * limit;

    // =========================
    // BASE QUERY (WITH RANKING)
    // =========================
    const baseQuery = `
        SELECT
            p.*,

            MATCH(p.title, p.content)
            AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance,

            (p.total_votes * 0.5) AS vote_score,

            ((p.upvotes - p.downvotes) * 2) AS quality_score,

            (1 / (TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2)) * 50 AS freshness_score,

            (
                MATCH(p.title, p.content)
                AGAINST (? IN NATURAL LANGUAGE MODE) * 3
                +
                (p.total_votes * 0.5)
                +
                ((p.upvotes - p.downvotes) * 2)
                +
                (1 / (TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2)) * 50
            ) AS score

        FROM polls p

        WHERE MATCH(p.title, p.content)
        AGAINST (? IN NATURAL LANGUAGE MODE)

        ORDER BY score DESC
        LIMIT ? OFFSET ?
    `;

    // =========================
    // MAIN DATA QUERY
    // =========================
    const dataSql = `
        SELECT
            p.id AS poll_id,
            p.title,
            p.content,
            p.total_votes,
            p.upvotes,
            p.downvotes,
            p.created_at,

            u.followers_count,
            u.following_count,
            uf.following_id AS is_following,
            pr.vote AS user_reaction,

            u.id AS user_id,
            u.name,
            u.user_name,
            u.image,

            po.id AS option_id,
            po.option_text,
            po.vote_count,
        
            pv.option_id AS user_voted_option_id,

            oc.id AS user_reason_id,
            oc.comment AS user_reason 


        FROM (${baseQuery}) p

        INNER JOIN users u
            ON p.created_by = u.id

        LEFT JOIN poll_options po
            ON po.poll_id = p.id

        LEFT JOIN poll_votes pv
            ON pv.poll_id = p.id
            AND pv.user_id = ?

        LEFT JOIN poll_reactions pr
            ON pr.poll_id = p.id
            AND pr.user_id = ?

        LEFT JOIN user_follows uf
            ON uf.following_id = u.id
            AND uf.follower_id = ?
        LEFT JOIN option_comments oc
            ON oc.option_id = pv.option_id AND oc.user_id = pv.user_id
    `;

    // =========================
    // COUNT QUERY
    // =========================
    const countSql = `
        SELECT COUNT(*) AS total
        FROM polls p
        WHERE MATCH(p.title, p.content)
        AGAINST (? IN NATURAL LANGUAGE MODE)
    `;

    // =========================
    // EXECUTE
    // =========================
    const [[rows], [countResult]]: any = await Promise.all([
        pool.query(
            dataSql,
            [
                search, // relevance
                search, // score calc
                search, // WHERE clause
                limit,
                offset,
                userId,
                userId,
                userId
            ]
        ),
        pool.query(countSql, [search]),
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // =========================
    // MAP RESULTS
    // =========================
    const pollMap = new Map<number, PollListingDto>();

    for (const row of rows) {

        if (!pollMap.has(row.poll_id)) {

            pollMap.set(row.poll_id, {
                pollId: row.poll_id,
                title: row.title,
                content: row.content,
                totalVotes: row.total_votes,
                upvotes: row.upvotes,
                downvotes: row.downvotes,
                userReaction: userId ? (row.user_reaction ?? null) : null,
                createdAt: new Date(row.created_at).toISOString(),
                hasVoted: userId ? row.user_voted_option_id != null : false,
                userVoteOptionId: row.user_voted_option_id || null,
                hasReason: userId
                    ? row.user_voted_option_id != null && row.user_reason_id != null : false,
                userReasonId: row.user_reason_id ?? null,
                userReason: row.user_reason ?? null,
                options: [],
                user: {
                    id: row.user_id,
                    name: row.name,
                    userName: row.user_name,
                    image: row.image,
                    followersCount: row.followers_count,
                    followingCount: row.following_count,
                    isFollowing: userId ? row.is_following != null : false,
                },
            });
        }

        if (row.option_id) {

            const poll = pollMap.get(row.poll_id)!;

            if (!poll.options.some(o => o.id === row.option_id)) {

                poll.options.push({
                    id: row.option_id,
                    optionText: row.option_text,
                    voteCount: row.vote_count,
                });
            }
        }
    }

    const data = Array.from(pollMap.values());

    return {
        data,
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

// export async function getPolls(
//     userId: number | null,
//     page: number = 1,
//     limit: number = DEFAULT_PAGE_LIMIT,
//     feedType: "for_you" | "following" = "for_you"
// ): Promise<PagedResponse<PollListingDto>> {

//     page = Math.max(1, page);
//     limit = Math.min(50, limit);

//     const offset = (page - 1) * limit;

//     //Build dynamic base query
//     let baseQuery = "";
//     let params: any[] = [];

//     if (feedType === "following" && userId) {
//         baseQuery = `
//       SELECT p.*
//       FROM polls p
//       INNER JOIN user_follows uf
//         ON p.created_by = uf.following_id
//       WHERE uf.follower_id = ?
//       ORDER BY p.created_at DESC
//       LIMIT ? OFFSET ?
//     `;
//         params = [userId, limit, offset];
//     } else {
//         // FOR YOU ranking
//         baseQuery = `
//       SELECT *,
//         (
//           (upvotes - downvotes) * 2 +
//           total_votes +
//           (1 / (TIMESTAMPDIFF(HOUR, created_at, NOW()) + 2))
//         ) AS score
//       FROM polls
//       ORDER BY score DESC
//       LIMIT ? OFFSET ?
//     `;
//         params = [limit, offset];
//     }

//     //FULL DATA QUERY
//     const dataSql = `
//     SELECT
//       p.id AS poll_id,
//       p.title,
//       p.content,
//       p.total_votes,
//       p.upvotes,
//       p.downvotes,
//       p.created_at,

//       u.followers_count,
//       u.following_count,
//       uf.following_id AS is_following,
//       pr.vote AS user_reaction,

//       u.id AS user_id,
//       u.name,
//       u.user_name,
//       u.image,

//       po.id AS option_id,
//       po.option_text,
//       po.vote_count,

//       pv.option_id AS user_voted_option_id

//     FROM (${baseQuery}) p

//     INNER JOIN users u ON p.created_by = u.id

//     LEFT JOIN poll_options po ON po.poll_id = p.id

//     LEFT JOIN poll_votes pv
//       ON pv.poll_id = p.id AND pv.user_id = ?

//     LEFT JOIN poll_reactions pr
//       ON pr.poll_id = p.id AND pr.user_id = ?

//     LEFT JOIN user_follows uf
//       ON uf.following_id = u.id AND uf.follower_id = ?
//   `;

//     // ✅ COUNT QUERY (VERY IMPORTANT FIX)
//     let countSql = "";
//     let countParams: any[] = [];

//     if (feedType === "following" && userId) {
//         countSql = `
//       SELECT COUNT(*) AS total
//       FROM polls p
//       INNER JOIN user_follows uf
//         ON p.created_by = uf.following_id
//       WHERE uf.follower_id = ?
//     `;
//         countParams = [userId];
//     } else {
//         countSql = `SELECT COUNT(*) AS total FROM polls`;
//     }

//     const [[rows], [countResult]]: any = await Promise.all([
//         pool.query(dataSql, [...params, userId, userId, userId]),
//         pool.query(countSql, countParams),
//     ]);

//     const total = countResult[0].total;
//     const totalPages = Math.ceil(total / limit);

//     //GROUP POLLS
//     const pollMap = new Map<number, PollListingDto>();

//     for (const row of rows) {
//         if (!pollMap.has(row.poll_id)) {
//             pollMap.set(row.poll_id, {
//                 pollId: row.poll_id,
//                 title: row.title,
//                 content: row.content,
//                 totalVotes: row.total_votes,
//                 upvotes: row.upvotes,
//                 downvotes: row.downvotes,
//                 userReaction: userId ? (row.user_reaction ?? null) : null,
//                 createdAt: new Date(row.created_at).toISOString(),
//                 hasVoted: userId ? row.user_voted_option_id != null : false,
//                 userVoteOptionId: row.user_voted_option_id || null,
//                 options: [],
//                 user: {
//                     id: row.user_id,
//                     name: row.name,
//                     userName: row.user_name,
//                     image: row.image,
//                     followersCount: row.followers_count,
//                     followingCount: row.following_count,
//                     isFollowing: userId ? row.is_following != null : false,
//                 },
//             });
//         }

//         if (row.option_id) {
//             const poll = pollMap.get(row.poll_id)!;

//             if (!poll.options.some((o) => o.id === row.option_id)) {
//                 poll.options.push({
//                     id: row.option_id,
//                     optionText: row.option_text,
//                     voteCount: row.vote_count,
//                 });
//             }
//         }
//     }

//     const data = Array.from(pollMap.values());

//     return {
//         data,
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//     };
// }


export async function getPollById(userId: number | null, pollId: number): Promise<PollDetailsDto> {

    const dataSql = `SELECT
            p.id AS poll_id,
            p.title,
            p.content,
            p.total_votes,
            p.upvotes,          
            p.downvotes,
            u.followers_count,
            u.following_count,
            uf.following_id AS is_following,
            pr.vote AS user_reaction,
            p.created_at,

            u.id AS user_id,
            u.name,
            u.user_name,
            u.image,

            po.id AS option_id,
            po.option_text,
            po.vote_count,

            pv.option_id AS user_voted_option_id,
            
            oc.id AS user_reason_id,
            oc.comment AS user_reason 


        FROM polls p

        INNER JOIN users u ON p.created_by = u.id
        LEFT JOIN poll_options po ON po.poll_id = p.id
        LEFT JOIN poll_votes pv 
            ON pv.poll_id = p.id AND pv.user_id = ?
        LEFT JOIN poll_reactions pr 
            ON pr.poll_id = p.id AND pr.user_id = ?
        LEFT JOIN user_follows uf 
            ON uf.following_id = u.id AND uf.follower_id = ?
        LEFT JOIN option_comments oc
            ON oc.option_id = pv.option_id AND oc.user_id = pv.user_id

        WHERE p.id=?`;


    const [rows]: any = await pool.query(dataSql, [userId, userId, userId, pollId]);

    if (!rows.length) {
        throw new AppError("Poll not found");
    }

    let poll: PollDetailsDto | null = null;

    for (const row of rows) {
        if (!poll) {
            poll = {
                pollId: row.poll_id,
                title: row.title,
                content: row.content,
                totalVotes: row.total_votes,
                upvotes: row.upvotes,
                downvotes: row.downvotes,
                userReaction: userId ? (row.user_reaction ?? null) : null,
                createdAt: new Date(row.created_at).toISOString(),
                hasVoted: userId ? row.user_voted_option_id != null : false,
                userVoteOptionId: row.user_voted_option_id || null,

                hasReason: userId
                    ? row.user_voted_option_id != null && row.user_reason_id != null : false,
                userReasonId: row.user_reason_id ?? null,
                userReason: row.user_reason ?? null,

                options: [],
                user: {
                    id: row.user_id,
                    name: row.name,
                    userName: row.user_name,
                    image: row.image,
                    followersCount: row.followers_count,
                    followingCount: row.following_count,
                    isFollowing: userId ? row.is_following != null : false

                }
            };
        }

        if (row.option_id) {
            poll.options.push({
                id: row.option_id,
                optionText: row.option_text,
                voteCount: row.vote_count
            });
        }
    }

    if (!poll) {
        throw new Error("Poll not found");
    }

    return poll;
}


export async function createPoll(poll: CreatePollDto) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        //1. Insert poll
        const [result]: any = await conn.query(
            `INSERT INTO polls (title, content, created_by)
             VALUES (?, ?, ?)`,
            [poll.title, poll.content, poll.createdBy]
        );

        const pollId = result.insertId;

        //2. Insert options
        for (const optionText of poll.options) {
            await conn.query(
                `INSERT INTO poll_options (poll_id, option_text)
                 VALUES (?, ?)`,
                [pollId, optionText]
            );
        }

        // 3. Insert topics (if any)
        if (poll.topicIds && poll.topicIds.length > 0) {
            for (const topicId of poll.topicIds) {
                await conn.query(
                    `INSERT INTO poll_topics (poll_id, topic_id)
                     VALUES (?, ?)`,
                    [pollId, topicId]
                );
            }
        }

        //Commit everything
        await conn.commit();

        return pollId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function addReason(userId: number, pollId: number, optionId: number, comment: string) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const trimmed = comment.trim();

        //1. Ensure user has voted
        const [voteRows]: any = await conn.query(
            `SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?`,
            [pollId, userId]
        );

        if (!voteRows.length) {
            throw new AppError("You must vote before adding a reason");
        }

        //2. Ensure option matches user's vote
        if (voteRows[0].option_id !== optionId) {
            throw new AppError("Reason must match your selected option");
        }

        // 3. Ensure option belongs to poll
        const [optionRows]: any = await conn.query(
            `SELECT id FROM poll_options WHERE id = ? AND poll_id = ?`,
            [optionId, pollId]
        );

        if (!optionRows.length) {
            throw new AppError("Invalid option selected");
        }

        //4. Insert reason (UNIQUE constraint will protect against duplicates)
        const [result] = await conn.query<ResultSetHeader>(
            `INSERT INTO option_comments (option_id, user_id, comment) VALUES (?, ?, ?)`,
            [optionId, userId, trimmed]
        );


        const [pollRows]: any = await conn.query(
            `
            SELECT p.created_by
            FROM polls p
            INNER JOIN poll_options po ON po.poll_id = p.id
            WHERE po.id = ?
            `,
            [optionId]
        );

        const pollOwnerId = pollRows[0].created_by;

        await conn.commit();

        void createNotification({
            userId: pollOwnerId,
            actorUserId: userId,
            type: "REASON_ADDED",
            referenceType: "COMMENT",
            referenceId: result.insertId
        })
            .catch(err => {
                console.error("Notification failed:", err);
            });
        ;


        return {
            id: result.insertId,
            optionId,
            comment: trimmed,
        };


    } catch (err: any) {
        await conn.rollback();

        //Handle duplicate reason (UNIQUE constraint)
        if (err.code === "ER_DUP_ENTRY") {
            throw new AppError("You have already added a reason");
        }

        throw err;

    } finally {
        conn.release();
    }
}

export async function castVote(userId: number, pollId: number, optionId: number) {
    //await delay();
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();


        await conn.query(
            `INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)`,
            [pollId, optionId, userId]
        );


        const [optionRows]: any = await conn.query(`SELECT id FROM poll_options WHERE id = ? AND poll_id = ?`,
            [optionId, pollId]);

        if (!optionRows.length) {
            throw new AppError("Invalid option selected");
        }

        await conn.query(
            `UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?`,
            [optionId]
        );

        await conn.query(
            `UPDATE polls SET total_votes = total_votes + 1 WHERE id = ?`,
            [pollId]
        );

        await conn.commit();
    } catch (err: any) {
        await conn.rollback();

        if (err.code === "ER_DUP_ENTRY") {
            throw new AppError("You already voted");
        }

        throw err;
    } finally {
        conn.release();
    }
}

export async function getPollReasons(pollId: number, loggedInUserId: number | null, optionId: number | null,
    sortBy: "top" | "latest" = "top", limit: number = 20, offset: number = 0): Promise<CommentDto[]> {

    let orderClause = "c.created_at DESC";

    if (sortBy === "top") {
        orderClause = "(c.upvotes - c.downvotes) DESC, c.created_at DESC";
    }

    const optionFilter = optionId != null ? "AND c.option_id = ?" : "";

    const params = [loggedInUserId ?? null, pollId];

    if (optionId != null) {
        params.push(optionId);
    }

    params.push(limit);
    params.push(offset);

    const sql = `
        SELECT
            c.id,
            c.option_id,
            c.comment,
            c.created_at,
            c.user_id,
            u.name,
            c.upvotes,
            c.downvotes,
            cr.vote AS user_reaction
        FROM option_comments c
        INNER JOIN poll_options po
            ON po.id = c.option_id
        INNER JOIN users u
            ON u.id = c.user_id
        LEFT JOIN comment_reactions cr
            ON cr.comment_id = c.id
            AND cr.user_id = ?
        WHERE po.poll_id = ?
        ${optionFilter}
        ORDER BY ${orderClause}
        LIMIT ? OFFSET ?
    `;

    const [rows]: any = await pool.query(sql, params);

    return rows.map((row: any) => ({
        id: row.id,
        optionId: row.option_id,
        comment: row.comment,
        createdAt: new Date(row.created_at).toISOString(),
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        userReaction: row.user_reaction ?? null,
        user: {
            userId: row.user_id,
            name: row.name,
        },
    }));
}


export async function getCommentsByOptionId(
    optionId: number,
    loggedInUserId: number | null,
    sortBy: "latest" | "top" = "top"
): Promise<CommentDto[]> {

    if (optionId == null) return [];

    let orderClause = "c.created_at DESC";

    if (sortBy === "top") {
        orderClause = "(c.upvotes - c.downvotes) DESC, c.created_at DESC";
    }

    const sql = `
      SELECT 
          c.id,
          c.option_id,
          c.comment,
          c.created_at,
          c.user_id,
          u.name,
          c.upvotes,
          c.downvotes,
          cr.vote AS user_reaction,
          (c.upvotes - c.downvotes) AS score
      FROM option_comments c
      INNER JOIN users u 
          ON u.id = c.user_id
      LEFT JOIN comment_reactions cr 
          ON cr.comment_id = c.id 
          AND cr.user_id = ?
      WHERE c.option_id = ?
      ORDER BY ${orderClause};
  `;

    const [rows]: any = await pool.query(sql, [
        loggedInUserId ?? null,
        optionId
    ]);

    return rows.map((row: any) => ({
        id: row.id,
        optionId: row.option_id,
        comment: row.comment,
        createdAt: new Date(row.created_at).toISOString(),
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        userReaction: row.user_reaction ?? null,
        user: {
            userId: row.user_id,
            name: row.name,
        },
    }));
}

export async function togglePollReaction(
    userId: number,
    pollId: number,
    vote: Vote
) {
    validateVote(vote);

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.query<ReactionRow[]>(
            `
            SELECT vote
            FROM poll_reactions
            WHERE poll_id = ? AND user_id = ?
            FOR UPDATE
            `,
            [pollId, userId]
        );

        // ✅ get owner ONCE
        const [pollRows]: any = await conn.query(
            `SELECT created_by FROM polls WHERE id = ?`,
            [pollId]
        );

        const pollOwnerId = pollRows[0].created_by;

        if (rows.length === 0) {
            // ✅ CASE 1: New vote

            await conn.query(
                `INSERT INTO poll_reactions (poll_id, user_id, vote)
                 VALUES (?, ?, ?)`,
                [pollId, userId, vote]
            );

            await conn.query(
                vote === 1
                    ? `UPDATE polls SET upvotes = upvotes + 1 WHERE id = ?`
                    : `UPDATE polls SET downvotes = downvotes + 1 WHERE id = ?`,
                [pollId]
            );

            await conn.commit();

            void createNotification({
                userId: pollOwnerId,
                actorUserId: userId,
                type: "POLL_REACTED",
                referenceType: "POLL",
                referenceId: pollId,
                data: { type: "POLL_REACTED", pollId, vote, userId }
            }).catch(err => console.error("Notification failed:", err));

            return { vote };

        } else {
            const currentVote = rows[0].vote;

            if (currentVote === vote) {
                // CASE 2: Remove vote

                await conn.query(
                    `DELETE FROM poll_reactions WHERE poll_id = ? AND user_id = ?`,
                    [pollId, userId]
                );

                await conn.query(
                    vote === 1
                        ? `UPDATE polls SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = ?`
                        : `UPDATE polls SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = ?`,
                    [pollId]
                );

                await conn.commit();

                return { vote: null };

            } else {
                // CASE 3: Switch vote

                await conn.query(
                    `UPDATE poll_reactions SET vote = ? WHERE poll_id = ? AND user_id = ?`,
                    [vote, pollId, userId]
                );

                await conn.query(
                    vote === 1
                        ? `UPDATE polls SET
                            upvotes = upvotes + 1,
                            downvotes = GREATEST(downvotes - 1, 0)
                           WHERE id = ?`
                        : `UPDATE polls SET
                            downvotes = downvotes + 1,
                            upvotes = GREATEST(upvotes - 1, 0)
                           WHERE id = ?`,
                    [pollId]
                );

                await conn.commit();

                return { vote };
            }
        }

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}


export async function toggleCommentReaction(
    userId: number,
    commentId: number,
    vote: Vote
) {
    validateVote(vote);

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.query<ReactionRow[]>(
            `
            SELECT vote
            FROM comment_reactions
            WHERE comment_id = ? AND user_id = ?
            FOR UPDATE
            `,
            [commentId, userId]
        );

        if (rows.length === 0) {
            // CASE 1: New vote
            await conn.query(
                `
                INSERT INTO comment_reactions (comment_id, user_id, vote)
                VALUES (?, ?, ?)
                `,
                [commentId, userId, vote]
            );

            await conn.query(
                vote === 1
                    ? `
                    UPDATE option_comments
                    SET upvotes = upvotes + 1
                    WHERE id = ?
                    `
                    : `
                    UPDATE option_comments
                    SET downvotes = downvotes + 1
                    WHERE id = ?
                    `,
                [commentId]
            );

            const [commentRows]: any = await conn.query(
                `SELECT user_id FROM option_comments WHERE id = ?`,
                [commentId]
            );

            const commentOwnerId = commentRows[0].user_id;


            await conn.commit();


            if (rows.length === 0 || rows[0].vote !== vote) {
                void createNotification({
                    userId: commentOwnerId,
                    actorUserId: userId,
                    type: "COMMENT_REACTED",
                    referenceType: "COMMENT",
                    referenceId: commentId,
                    data: { type: "COMMENT_REACTED", reasonId: commentId, userId, vote }
                })
                    .catch(err => {
                        console.error("Notification failed:", err);
                    });
                ;
            }


            return { vote };

        } else {
            const currentVote = rows[0].vote;

            if (currentVote === vote) {
                // CASE 2: Remove vote
                await conn.query(
                    `
                    DELETE FROM comment_reactions
                    WHERE comment_id = ? AND user_id = ?
                    `,
                    [commentId, userId]
                );

                await conn.query(
                    vote === 1
                        ? `
                        UPDATE option_comments
                        SET upvotes = GREATEST(upvotes - 1, 0)
                        WHERE id = ?
                        `
                        : `
                        UPDATE option_comments
                        SET downvotes = GREATEST(downvotes - 1, 0)
                        WHERE id = ?
                        `,
                    [commentId]
                );

                await conn.commit();

                return { vote: null };

            } else {
                // CASE 3: Switch vote
                await conn.query(
                    `
                    UPDATE comment_reactions
                    SET vote = ?
                    WHERE comment_id = ? AND user_id = ?
                    `,
                    [vote, commentId, userId]
                );

                await conn.query(
                    vote === 1
                        ? `
                        UPDATE option_comments
                        SET
                            upvotes = upvotes + 1,
                            downvotes = GREATEST(downvotes - 1, 0)
                        WHERE id = ?
                        `
                        : `
                        UPDATE option_comments
                        SET
                            downvotes = downvotes + 1,
                            upvotes = GREATEST(upvotes - 1, 0)
                        WHERE id = ?
                        `,
                    [commentId]
                );

                await conn.commit();

                return { vote };
            }
        }

    } catch (err) {
        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
}
