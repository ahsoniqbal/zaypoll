import pool from "@/lib/db";
import { fillTimelineIntervals, groupTopLocations, readableDuration, safePercentage, timelineGranularity } from "@/lib/poll-analytics.utils";
import type { AnalyticsEventContext, AudienceItem, PollAnalytics, PollInsight, TimelineGranularity } from "@/types/poll-analytics.types";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { unstable_cache } from "next/cache";

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
      SELECT u.age_group, COUNT(*) AS voter_count FROM poll_votes v
      INNER JOIN users u ON u.id = v.user_id WHERE v.poll_id = ? AND u.age_group IS NOT NULL
      GROUP BY u.age_group ORDER BY FIELD(u.age_group, 'under_18','18_24','25_34','35_44','45_54','55_plus')`, [pollId]),
    pool.query<CountRow[]>("SELECT COUNT(*) AS count FROM poll_votes WHERE poll_id = ?", [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT country_code AS label, COUNT(*) AS count FROM poll_events
      WHERE poll_id = ? AND event_type = 'VOTE' AND country_code IS NOT NULL
      GROUP BY country_code ORDER BY count DESC`, [pollId]),
    pool.query<RowDataPacket[]>(`
      SELECT device_type AS label, COUNT(*) AS count FROM poll_events
      WHERE poll_id = ? AND event_type = 'VOTE' GROUP BY device_type ORDER BY count DESC`, [pollId]),
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
  const knownAge = ageResult[0].reduce((sum, row) => sum + Number(row.voter_count), 0);
  const allVoters = Number(audienceTotalResult[0][0]?.count ?? 0);
  const audienceItems = (rows: RowDataPacket[], formatter = (label: string) => label): AudienceItem[] => {
    const total = rows.reduce((sum, row) => sum + Number(row.count), 0);
    return rows.map((row) => ({ label: formatter(String(row.label)), count: Number(row.count), percentage: safePercentage(Number(row.count), total) }));
  };
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
  const deviceItems = audienceItems(deviceResult[0], (label) => label[0]?.toUpperCase() + label.slice(1));
  if (deviceItems[0]?.percentage >= 60) facts.push({ type: "device", text: `${deviceItems[0].percentage}% of recorded voter devices are ${deviceItems[0].label.toLowerCase()}.` });

  const sentiment = sentimentResult[0][0] ?? {};
  return {
    overview: { totalVotes, views: Number(overview.views), uniqueViews: Number(overview.unique_views), reasons: Number(overview.reasons), reactions: Number(overview.reactions), createdAt: createdAt.toISOString(), duration: readableDuration(createdAt) },
    voteDistribution: distributionRows.map((row) => ({ optionId: Number(row.id), optionText: row.option_text, voteCount: Number(row.vote_count), percentage: safePercentage(Number(row.vote_count), totalVotes) })),
    timeline: { granularity, points: fillTimelineIntervals(timelineResult[0].map((row) => ({ period: row.period, voteCount: Number(row.vote_count) })), createdAt, granularity) },
    audience: {
      age: { items: knownAge < 10 ? [] : ageResult[0].map((row) => ({ ageGroup: row.age_group, label: String(row.age_group).replace("under_18", "Under 18").replace("55_plus", "55+").replace("_", "–"), count: Number(row.voter_count), percentage: safePercentage(Number(row.voter_count), knownAge) })), coverage: { knownCount: knownAge, totalCount: allVoters, coveragePercentage: safePercentage(knownAge, allVoters) }, isPrivate: knownAge < 10 },
      locations: groupTopLocations(audienceItems(locationResult[0], countryName)),
      devices: deviceItems,
    },
    sentiment: { positive: Number(sentiment.positive ?? 0), neutral: Number(sentiment.neutral ?? 0), negative: Number(sentiment.negative ?? 0), analyzedReasons: Number(sentiment.analyzed_reasons ?? 0), totalReasons: Number(sentiment.total_reasons ?? 0) },
    insights, facts, aiConfigured: Boolean(process.env.GEMINI_API_KEY), aiEligible: totalVotes >= 10 && Number(overview.reasons) >= 5,
  };
}

export function getPollAnalytics(pollId: number): Promise<PollAnalytics> {
  return unstable_cache(
    () => getPollAnalyticsUncached(pollId),
    [`poll-analytics-${pollId}`],
    { revalidate: 60, tags: [`poll-analytics:${pollId}`] },
  )();
}
