import pool from "@/lib/db";
import { fillTimelineIntervals, readableDuration, safePercentage, timelineGranularity } from "@/lib/poll-analytics.utils";
import type { AnalyticsEventContext, PollAnalytics, PollInsight, TimelineGranularity } from "@/types/poll-analytics.types";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { unstable_cache } from "next/cache";
import { areAiInsightsEnabled } from "@/lib/server/ai-insights";

type CountRow = RowDataPacket & { count: number };

function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  try { return JSON.parse(String(value)) as T; } catch { return fallback; }
}

function countryName(code: string) {
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code; } catch { return code; }
}

export async function insertPollEvent(
  connection: PoolConnection,
  data: { pollId: number; userId: number | null; eventType: "VIEW" | "VOTE" | "REASON_ADDED" | "REACTION"; optionId?: number | null; context: AnalyticsEventContext },
) {
  await connection.query(
    `INSERT INTO poll_events (poll_id, user_id, session_id, event_type, option_id, country_code, device_type, operating_system)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.pollId, data.userId, data.context.sessionId, data.eventType, data.optionId ?? null, data.context.countryCode, data.context.deviceType, data.context.operatingSystem],
  );
}

export async function trackPollView(pollId: number, userId: number | null, context: AnalyticsEventContext) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const identityClause = userId ? "user_id = ?" : "session_id = ?";
    const identity = userId ?? context.sessionId;
    if (!identity) {
      await conn.rollback();
      return false;
    }
    const [existing] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM poll_events
       WHERE poll_id = ? AND event_type = 'VIEW' AND ${identityClause}
         AND created_at >= UTC_TIMESTAMP() - INTERVAL 30 MINUTE
       LIMIT 1 FOR UPDATE`,
      [pollId, identity],
    );
    if (existing.length === 0) {
      await insertPollEvent(conn, { pollId, userId, eventType: "VIEW", context });
    }
    await conn.commit();
    return existing.length === 0;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function timelineSql(granularity: TimelineGranularity) {
  if (granularity === "hour") return "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')";
  if (granularity === "day") return "DATE(created_at)";
  return "DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY)";
}

async function getPollAnalyticsUncached(pollId: number): Promise<PollAnalytics> {
  const aiEnabled = areAiInsightsEnabled();
  const [pollRows] = await pool.query<RowDataPacket[]>("SELECT created_at, total_votes FROM polls WHERE id = ? LIMIT 1", [pollId]);
  if (!pollRows.length) throw new Error("Poll not found");
  const createdAt = new Date(pollRows[0].created_at);
  const granularity = timelineGranularity(createdAt);

  const [overviewResult, distributionResult, timelineResult, ageResult, audienceTotalResult, locationResult, deviceResult, sentimentResult, insightResult] = await Promise.all([
    pool.query<RowDataPacket[]>(`
      SELECT p.total_votes, p.upvotes + p.downvotes AS reactions,
        (SELECT COUNT(*) FROM option_comments c INNER JOIN poll_options o ON o.id = c.option_id WHERE o.poll_id = p.id) AS reasons,
        (SELECT COUNT(*) FROM poll_events e WHERE e.poll_id = p.id AND e.event_type = 'VIEW') AS views,
        (SELECT COUNT(DISTINCT COALESCE(CONCAT('u:', e.user_id), CONCAT('s:', e.session_id))) FROM poll_events e WHERE e.poll_id = p.id AND e.event_type = 'VIEW') AS unique_views
      FROM polls p WHERE p.id = ?`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT o.id, o.option_text, COUNT(v.id) AS vote_count
      FROM poll_options o LEFT JOIN poll_votes v ON v.option_id = o.id AND v.poll_id = o.poll_id
      WHERE o.poll_id = ? GROUP BY o.id, o.option_text, o.display_order ORDER BY o.display_order, o.id`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT ${timelineSql(granularity)} AS period, COUNT(*) AS vote_count
      FROM poll_votes WHERE poll_id = ? GROUP BY period ORDER BY period`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT u.age_group, o.id AS option_id, o.option_text, COUNT(*) AS vote_count
      FROM poll_votes v
      INNER JOIN users u ON u.id = v.user_id
      INNER JOIN poll_options o ON o.id = v.option_id AND o.poll_id = v.poll_id
      WHERE v.poll_id = ? AND u.age_group IS NOT NULL
      GROUP BY u.age_group, o.id, o.option_text, o.display_order
      ORDER BY FIELD(u.age_group, 'under_18','18_24','25_34','35_44','45_54','55_plus'), o.display_order, o.id`, [pollId]),
    pool.query<CountRow[]>("SELECT COUNT(*) AS count FROM poll_votes WHERE poll_id = ?", [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT e.country_code, o.id AS option_id, o.option_text, COUNT(*) AS vote_count
      FROM poll_events e
      INNER JOIN poll_options o ON o.id = e.option_id AND o.poll_id = e.poll_id
      WHERE e.poll_id = ? AND e.event_type = 'VOTE' AND e.country_code IS NOT NULL
      GROUP BY e.country_code, o.id, o.option_text, o.display_order
      ORDER BY e.country_code, o.display_order, o.id`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT e.device_type, o.id AS option_id, o.option_text, COUNT(*) AS vote_count
      FROM poll_events e
      INNER JOIN poll_options o ON o.id = e.option_id AND o.poll_id = e.poll_id
      WHERE e.poll_id = ? AND e.event_type = 'VOTE'
      GROUP BY e.device_type, o.id, o.option_text, o.display_order
      ORDER BY e.device_type, o.display_order, o.id`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS analyzed_reasons,
        SUM(sentiment = 'positive') AS positive, SUM(sentiment = 'neutral') AS neutral, SUM(sentiment = 'negative') AS negative,
        (SELECT COUNT(*) FROM option_comments c INNER JOIN poll_options o ON o.id = c.option_id WHERE o.poll_id = ?) AS total_reasons
      FROM reason_ai_analysis a INNER JOIN option_comments c ON c.id = a.reason_id INNER JOIN poll_options o ON o.id = c.option_id WHERE o.poll_id = ?`, [pollId, pollId]),
    pool.query<RowDataPacket[]>("SELECT * FROM poll_ai_insights WHERE poll_id = ? LIMIT 1", [pollId]),
  ]);

  const overview = overviewResult[0][0];
  const distributionRows = distributionResult[0];
  const totalVotes = distributionRows.reduce((sum, row) => sum + Number(row.vote_count), 0);
  const knownAge = ageResult[0].reduce((sum, row) => sum + Number(row.vote_count), 0);
  const allVoters = Number(audienceTotalResult[0][0]?.count ?? 0);
  const insightRow = insightResult[0][0];
  const insights: PollInsight | null = insightRow ? {
    summary: insightRow.summary,
    optionSummaries: asJson(insightRow.option_summaries, []),
    keyThemes: asJson(insightRow.key_themes, []),
    interestingFacts: asJson(insightRow.interesting_facts, []),
    reasonsAnalyzed: Number(insightRow.reasons_analyzed), votesAtGeneration: Number(insightRow.votes_at_generation),
    modelName: insightRow.model_name, generatedAt: new Date(insightRow.generated_at).toISOString(),
  } : null;
  const facts: Array<{ text: string; type: string }> = [];
  if (totalVotes > 0 && distributionRows.length) {
    const leader = [...distributionRows].sort((a, b) => Number(b.vote_count) - Number(a.vote_count))[0];
    facts.push({ type: "vote", text: `${leader.option_text} currently leads with ${safePercentage(Number(leader.vote_count), totalVotes)}% of votes.` });
  }
  const deviceTypes = [...new Set(deviceResult[0].map((row) => String(row.device_type)))];
  const deviceGroups = deviceTypes
    .map((deviceType) => {
      const rows = deviceResult[0].filter((row) => row.device_type === deviceType);
      const totalVotes = rows.reduce((sum, row) => sum + Number(row.vote_count), 0);
      return {
        deviceType,
        label: deviceType[0]?.toUpperCase() + deviceType.slice(1),
        totalVotes,
        optionVotes: distributionRows.map((option) => {
          const voteCount = Number(rows.find((row) => Number(row.option_id) === Number(option.id))?.vote_count ?? 0);
          return {
            optionId: Number(option.id),
            voteCount,
            percentage: safePercentage(voteCount, totalVotes),
          };
        }),
      };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes);
  const recordedDeviceVotes = deviceGroups.reduce((sum, group) => sum + group.totalVotes, 0);
  if (deviceGroups[0] && safePercentage(deviceGroups[0].totalVotes, recordedDeviceVotes) >= 60) {
    facts.push({ type: "device", text: `${safePercentage(deviceGroups[0].totalVotes, recordedDeviceVotes)}% of recorded voter devices are ${deviceGroups[0].label.toLowerCase()}.` });
  }
  const ageGroupOrder = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_plus"];
  const ageLabel = (ageGroup: string) => ageGroup
    .replace("under_18", "Under 18")
    .replace("55_plus", "55+")
    .replace("_", "–");
  const ageGroups = ageGroupOrder
    .filter((ageGroup) => ageResult[0].some((row) => row.age_group === ageGroup))
    .map((ageGroup) => {
      const rows = ageResult[0].filter((row) => row.age_group === ageGroup);
      return {
        ageGroup,
        label: ageLabel(ageGroup),
        totalVotes: rows.reduce((sum, row) => sum + Number(row.vote_count), 0),
        optionVotes: distributionRows.map((option) => ({
          optionId: Number(option.id),
          voteCount: Number(rows.find((row) => Number(row.option_id) === Number(option.id))?.vote_count ?? 0),
        })),
      };
    });
  const locationGroups = [...new Set(locationResult[0].map((row) => String(row.country_code)))]
    .map((countryCode) => {
      const rows = locationResult[0].filter((row) => row.country_code === countryCode);
      const totalVotes = rows.reduce((sum, row) => sum + Number(row.vote_count), 0);
      return {
        countryCode,
        label: countryName(countryCode),
        totalVotes,
        optionVotes: distributionRows.map((option) => {
          const voteCount = Number(rows.find((row) => Number(row.option_id) === Number(option.id))?.vote_count ?? 0);
          return {
            optionId: Number(option.id),
            voteCount,
            percentage: safePercentage(voteCount, totalVotes),
          };
        }),
      };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 8);

  const sentiment = sentimentResult[0][0] ?? {};
  return {
    overview: { totalVotes, views: Number(overview.views), uniqueViews: Number(overview.unique_views), reasons: Number(overview.reasons), reactions: Number(overview.reactions), createdAt: createdAt.toISOString(), duration: readableDuration(createdAt) },
    voteDistribution: distributionRows.map((row) => ({ optionId: Number(row.id), optionText: row.option_text, voteCount: Number(row.vote_count), percentage: safePercentage(Number(row.vote_count), totalVotes) })),
    timeline: { granularity, points: fillTimelineIntervals(timelineResult[0].map((row) => ({ period: row.period, voteCount: Number(row.vote_count) })), createdAt, granularity) },
    audience: {
      age: {
        groups: knownAge < 10 ? [] : ageGroups,
        options: distributionRows.map((row) => ({ optionId: Number(row.id), optionText: row.option_text })),
        coverage: { knownCount: knownAge, totalCount: allVoters, coveragePercentage: safePercentage(knownAge, allVoters) },
        isPrivate: knownAge < 10,
      },
      locations: {
        groups: locationGroups,
        options: distributionRows.map((row) => ({ optionId: Number(row.id), optionText: row.option_text })),
      },
      devices: {
        groups: deviceGroups,
        options: distributionRows.map((row) => ({ optionId: Number(row.id), optionText: row.option_text })),
      },
    },
    sentiment: { positive: Number(sentiment.positive ?? 0), neutral: Number(sentiment.neutral ?? 0), negative: Number(sentiment.negative ?? 0), analyzedReasons: Number(sentiment.analyzed_reasons ?? 0), totalReasons: Number(sentiment.total_reasons ?? 0) },
    insights: aiEnabled ? insights : null,
    facts,
    aiEnabled,
    aiConfigured: aiEnabled && Boolean(process.env.GEMINI_API_KEY),
    aiEligible: aiEnabled && totalVotes >= 10 && Number(overview.reasons) >= 5,
  };
}

export function getPollAnalytics(pollId: number): Promise<PollAnalytics> {
  return unstable_cache(
    () => getPollAnalyticsUncached(pollId),
    [`poll-analytics-v4-${pollId}`],
    { revalidate: 60, tags: [`poll-analytics:${pollId}`] },
  )();
}
