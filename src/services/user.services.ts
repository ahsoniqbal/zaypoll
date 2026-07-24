import { PollListingDto } from "@/dto/poll.dtos";
import { CreateUserDto } from "@/dto/user.dto";
import pool from "@/lib/db";
import { AppError } from "@/lib/error";
import { PagedResponse } from "@/types/common.types";
import { DEFAULT_PAGE_LIMIT } from "@/types/constants";
import { User, UserDetails, UserRow } from "@/types/user.types";
import { ResultSetHeader } from "mysql2";
import { UserData } from "next-auth/providers/42-school";
import { createNotification } from "./notification.service";

function mapUser(user: UserRow): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        userName: user.user_name,
        createdAt: new Date(user.created_at).toISOString(),
    };

}

export async function getUserDetails(
    username: string,
    loggedInUserId: number | null
): Promise<UserDetails | null> {

    const sql = `
        select
            u.id,
            u.name,
            u.email,
            u.user_name,
            u.image,
            u.created_at as joined_on,
            u.followers_count,
            u.following_count,
            u.age_group,
            uf.following_id as is_following
        from users u
        left join user_follows uf 
            on uf.following_id = u.id and uf.follower_id = ?
        where u.user_name = ?;
    `;

    const [rows] = await pool.query<UserRow[]>(sql, [loggedInUserId ?? null, username]);

    if (rows.length === 0) {
        return null;
    }

    const row = rows[0];

    return {
        id: row.id,
        email: row.email,
        name: row.name,
        image: row.image,
        userName: row.user_name,
        joinedOn: row.joined_on,
        followersCount: row.followers_count,
        followingCount: row.following_count,
        isFollowing: Boolean(row.is_following),
        ageGroup: row.age_group ?? null,
    };
}

export async function registerUser(user: CreateUserDto): Promise<User> {
    const username = await generateUniqueUsername(user.name);

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users(name, email, image, user_name)
         VALUES (?, ?, ?, ?)`,
        [user.name, user.email, user.image ?? null, username]
    );

    return {
        id: result.insertId,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        userName: username,
        createdAt: new Date().toISOString(),
    };
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>('select * from users where email=?', [email]);
    if (rows.length === 0) {
        return null;
    }
    return mapUser(rows[0]);
}


export async function generateUniqueUsername(name: string): Promise<string> {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

    const pattern = `${base}-%`;

    const [rows]: any = await pool.query(
        `SELECT user_name FROM users WHERE user_name LIKE ?`,
        [pattern]
    );

    if (rows.length === 0) {
        return `${base}-1`;
    }

    const numbers = rows.map((r: any) => {
        const match = r.user_name.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
    });

    const nextNumber = Math.max(...numbers) + 1;

    return `${base}-${nextNumber}`;
}
``

export async function getAllUsers(query?: string) {
    await new Promise((resolve) => setTimeout(() => resolve("delay"), 1000));
    let sql = "SELECT * FROM users";
    const params: any[] = [];

    if (query) {
        sql += " WHERE username LIKE ?";
        params.push(`%${query}%`);
    }

    const [rows] = await pool.query<UserRow[]>(sql, params);
    return rows.map(u => mapUser(u));
}

export async function getUser(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>('select * from users where id=?', [id]);
    if (rows.length === 0) {
        return null;
    }
    return mapUser(rows[0]);
}

export async function createUser(user: { username: string, password: string }) {
    //const now = new Date().toISOString().slice(0, 19).replace("T", " "); //current datetime for mysql

    await pool.execute('insert into users(username, password) values (?,?)',
        [user.username, user.password])
}

export async function updateUser(id: number, user: { username: string, password: string }) {
    const [result] = await pool.execute<ResultSetHeader>(
        'update users set username=?, password=? where id=?',
        [user.username, user.password, id]);

    if (result.affectedRows === 0) {
        throw new AppError('User not found', 404);
    }

    return true;
}

export async function deleteUser(id: number) {
    const [result] = await pool.execute<ResultSetHeader>(
        'delete from users where id=?',
        [id]);

    if (result.affectedRows === 0) {
        throw new AppError('User not found', 404);
    }
    return true;
}

export async function toggleFollow(
    followerId: number,
    followingId: number
): Promise<{ isFollowing: boolean }> {

    if (followerId === followingId) {
        throw new AppError("You cannot follow yourself");
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows]: any = await conn.query(
            `SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?`,
            [followerId, followingId]
        );

        if (rows.length === 0) {
            //FOLLOW

            await conn.query(
                `INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)`,
                [followerId, followingId]
            );

            //increment counters
            await conn.query(
                `UPDATE users SET followers_count = followers_count + 1 WHERE id = ?`,
                [followingId]
            );

            await conn.query(
                `UPDATE users SET following_count = following_count + 1 WHERE id = ?`,
                [followerId]
            );


            void createNotification({
                userId: followingId,
                actorUserId: followerId,
                type: "USER_FOLLOWED",
                referenceType: "USER",
                referenceId: followerId,
                data: { type: "USER_FOLLOWED", userId: followerId }
            })
            .catch(err => {
                    console.error("Notification failed:", err);
                });
            ;


            await conn.commit();

            return { isFollowing: true };

        } else {
            //UNFOLLOW

            await conn.query(
                `DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?`,
                [followerId, followingId]
            );

            // decrement safely
            await conn.query(
                `UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = ?`,
                [followingId]
            );

            await conn.query(
                `UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = ?`,
                [followerId]
            );

            await conn.commit();

            return { isFollowing: false };
        }

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}


export async function isFollowing(
    followerId: number,
    followingId: number
): Promise<boolean> {

    const [rows]: any = await pool.query(
        `SELECT 1 FROM user_follows
     WHERE follower_id = ? AND following_id = ?
     LIMIT 1`,
        [followerId, followingId]
    );

    return rows.length > 0;
}

export async function getFollowers(userId: number) {
    const [rows]: any = await pool.query(
        `SELECT u.id, u.name, u.user_name, u.image
     FROM user_follows f
     INNER JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = ?`,
        [userId]
    );

    return rows;
}


export async function getFollowing(userId: number) {
    const [rows]: any = await pool.query(
        `SELECT u.id, u.name, u.user_name, u.image
     FROM user_follows f
     INNER JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = ?`,
        [userId]
    );

    return rows;
}

export async function getUserPolls(
    profileUserId: number,
    loggedInUserId: number | null,
    page: number = 1,
    limit: number = DEFAULT_PAGE_LIMIT
): Promise<PagedResponse<PollListingDto>> {

    page = Math.max(1, page);
    limit = Math.min(50, limit);
    const offset = (page - 1) * limit;

    const baseQuery = `
    SELECT *
    FROM polls
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

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

      pv.option_id AS user_voted_option_id

    FROM (${baseQuery}) p

    INNER JOIN users u ON p.created_by = u.id

    LEFT JOIN poll_options po ON po.poll_id = p.id

    LEFT JOIN poll_votes pv
      ON pv.poll_id = p.id AND pv.user_id = ?

    LEFT JOIN poll_reactions pr
      ON pr.poll_id = p.id AND pr.user_id = ?

    LEFT JOIN user_follows uf
      ON uf.following_id = u.id AND uf.follower_id = ?
  `;

    const countSql = `
    SELECT COUNT(*) AS total
    FROM polls
    WHERE created_by = ?
  `;

    const [[rows], [countResult]]: any = await Promise.all([
        pool.query(dataSql, [profileUserId, limit, offset, loggedInUserId, loggedInUserId, loggedInUserId]),
        pool.query(countSql, [profileUserId]),
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

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
                userReaction: loggedInUserId ? (row.user_reaction ?? null) : null,
                createdAt: new Date(row.created_at).toISOString(),
                hasVoted: loggedInUserId ? row.user_voted_option_id != null : false,
                userVoteOptionId: row.user_voted_option_id || null,
                hasReason: loggedInUserId
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
                    isFollowing: loggedInUserId ? row.is_following != null : false,
                },
            });
        }

        if (row.option_id) {
            const poll = pollMap.get(row.poll_id)!;

            if (!poll.options.some((o) => o.id === row.option_id)) {
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
//delete this in prod 
const delay = () => new Promise((resolve) => setTimeout(() => resolve('intentional delay'), 1000));


export async function getUserStats(userId: number) {
    await delay();
    const [rows]: any = await pool.query(
        `
    SELECT
      (SELECT COUNT(*) FROM polls p WHERE p.created_by = ?) AS totalPolls,

      (SELECT COALESCE(SUM(p.total_votes), 0)
       FROM polls p 
       WHERE p.created_by = ?) AS totalVotes,

      (SELECT COUNT(*)
       FROM option_comments oc
       INNER JOIN poll_options po ON po.id = oc.option_id
       INNER JOIN polls p ON p.id = po.poll_id
       WHERE p.created_by = ?) AS totalComments
    `,
        [userId, userId, userId]
    );

    return rows
}
