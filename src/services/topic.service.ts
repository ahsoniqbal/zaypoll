import { TopicDto } from "@/dto/category.dtos";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

type TopicRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  parent_id: number | null;
  parent_name?: string | null;
  parent_slug?: string | null;
  child_count?: number;
};

const toTopic = (row: TopicRow): TopicDto => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  iconUrl: row.icon_url,
  parentId: row.parent_id,
  parentName: row.parent_name ?? null,
  parentSlug: row.parent_slug ?? null,
  childCount: Number(row.child_count ?? 0),
});

const withAncestors = (topics: TopicDto[]): TopicDto[] => {
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));

  return topics.map((topic) => {
    const ancestors: NonNullable<TopicDto["ancestors"]> = [];
    const visited = new Set([topic.id]);
    let parentId = topic.parentId;

    while (parentId) {
      if (visited.has(parentId)) break;
      visited.add(parentId);

      const parent = topicsById.get(parentId);
      if (!parent) break;
      ancestors.unshift({ id: parent.id, name: parent.name, slug: parent.slug });
      parentId = parent.parentId;
    }

    return { ...topic, ancestors };
  });
};

export async function getParentTopics(): Promise<TopicDto[]> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT t.id, t.name, t.slug, t.icon_url, t.parent_id, COUNT(child.id) AS child_count
    FROM topics t
    LEFT JOIN topics child ON child.parent_id = t.id AND child.is_active = 1
    WHERE t.parent_id IS NULL AND t.is_active = 1
    GROUP BY t.id, t.name, t.slug, t.icon_url, t.parent_id, t.sort_order
    ORDER BY t.sort_order ASC, t.name ASC
  `);

  return rows.map(toTopic);
}

export async function getSearchableTopics(): Promise<TopicDto[]> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT t.id, t.name, t.slug, t.icon_url, t.parent_id,
           parent.name AS parent_name, parent.slug AS parent_slug
    FROM topics t
    LEFT JOIN topics parent ON parent.id = t.parent_id
    WHERE t.is_active = 1
    ORDER BY t.sort_order ASC, t.name ASC
  `);

  return withAncestors(rows.map(toTopic));
}

export async function getTopicBySlug(slug: string): Promise<TopicDto | null> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT t.id, t.name, t.slug, t.icon_url, t.parent_id,
           parent.name AS parent_name, parent.slug AS parent_slug
    FROM topics t
    LEFT JOIN topics parent ON parent.id = t.parent_id
    WHERE t.slug = ? AND t.is_active = 1
    LIMIT 1
  `, [slug]);

  return rows[0] ? toTopic(rows[0]) : null;
}

export async function getTopicById(id: number): Promise<TopicDto | null> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT t.id, t.name, t.slug, t.icon_url, t.parent_id
    FROM topics t
    WHERE t.id = ? AND t.is_active = 1
    LIMIT 1
  `, [id]);

  return rows[0] ? toTopic(rows[0]) : null;
}

export async function getSubTopics(parentId: number): Promise<TopicDto[]> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT id, name, slug, icon_url, parent_id
    FROM topics
    WHERE parent_id = ? AND is_active = 1
    ORDER BY sort_order ASC, name ASC
  `, [parentId]);

  return rows.map(toTopic);
}

export async function getTopicPath(topicId: number): Promise<TopicDto[]> {
  const [rows] = await pool.query<(TopicRow & { depth: number })[]>(`
    WITH RECURSIVE topic_path AS (
      SELECT id, name, slug, icon_url, parent_id, 0 AS depth,
             CAST(CONCAT(',', id, ',') AS CHAR(2000)) AS visited_ids
      FROM topics
      WHERE id = ? AND is_active = 1

      UNION ALL

      SELECT parent.id, parent.name, parent.slug, parent.icon_url,
             parent.parent_id, topic_path.depth + 1,
             CONCAT(topic_path.visited_ids, parent.id, ',')
      FROM topics parent
      INNER JOIN topic_path ON topic_path.parent_id = parent.id
      WHERE parent.is_active = 1
        AND topic_path.depth < 31
        AND LOCATE(CONCAT(',', parent.id, ','), topic_path.visited_ids) = 0
    )
    SELECT id, name, slug, icon_url, parent_id, depth
    FROM topic_path
    ORDER BY depth DESC
  `, [topicId]);

  return rows.map(toTopic);
}

export async function getTopicAndDescendantIds(topicId: number): Promise<number[]> {
  const [rows] = await pool.query<(RowDataPacket & { id: number })[]>(`
    WITH RECURSIVE topic_tree AS (
      SELECT id, 0 AS depth,
             CAST(CONCAT(',', id, ',') AS CHAR(2000)) AS visited_ids
      FROM topics
      WHERE id = ? AND is_active = 1

      UNION ALL

      SELECT child.id, parent.depth + 1,
             CONCAT(parent.visited_ids, child.id, ',')
      FROM topics child
      INNER JOIN topic_tree parent ON child.parent_id = parent.id
      WHERE child.is_active = 1
        AND parent.depth < 31
        AND LOCATE(CONCAT(',', child.id, ','), parent.visited_ids) = 0
    )
    SELECT id FROM topic_tree
  `, [topicId]);

  return rows.map((row) => row.id);
}

// Kept for existing callers that need every active topic.
export const getAllTopics = getSearchableTopics;
export const getTopics = getSearchableTopics;

export async function getTopicIdBySlug(slug: string): Promise<number | null> {
  const topic = await getTopicBySlug(slug);
  return topic?.id ?? null;
}
