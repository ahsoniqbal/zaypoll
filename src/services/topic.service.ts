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

export async function getParentTopics(): Promise<TopicDto[]> {
  const [rows] = await pool.query<TopicRow[]>(`
    SELECT t.id, t.name, t.slug, t.icon_url, t.parent_id, COUNT(child.id) AS child_count
    FROM topics t
    LEFT JOIN topics child ON child.parent_id = t.id AND child.is_active = 1
    WHERE t.parent_id IS NULL AND t.is_active = 1
    GROUP BY t.id, t.name, t.slug, t.icon_url, t.parent_id, t.is_trending
    ORDER BY t.is_trending DESC, t.name ASC
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
    ORDER BY t.name ASC
  `);

  return rows.map(toTopic);
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
    ORDER BY name ASC
  `, [parentId]);

  return rows.map(toTopic);
}

// Kept for existing callers that need every active topic.
export const getAllTopics = getSearchableTopics;
export const getTopics = getSearchableTopics;

export async function getTopicIdBySlug(slug: string): Promise<number | null> {
  const topic = await getTopicBySlug(slug);
  return topic?.id ?? null;
}
