import { TopicDto } from "@/dto/category.dtos";
import pool from "@/lib/db";

export async function getTopics(): Promise<TopicDto[]> {
    const [rows] = await pool.query("SELECT id, name, slug, icon_url FROM topics");

    return (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        iconUrl: row.icon_url,
    }));
}

export async function getTopicBySlug(slug: string): Promise<TopicDto | null> {
    const [rows]: any = await pool.query(
        "SELECT id, name, slug, icon_url FROM topics WHERE slug = ? LIMIT 1", [slug]);

    if (rows.length === 0) return null;

    const row = rows[0];

    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        iconUrl: row.icon_url,
    };
}

export async function getAllTopics(): Promise<TopicDto[]> {
    const [rows]: any = await pool.query(
        "SELECT id, name, slug, icon_url FROM topics ORDER BY name ASC");

    return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        iconUrl: row.icon_url,
    }));
}

export async function getTopicIdsBySlugs(slugs: string[]): Promise<number[]> {
    if (!slugs || slugs.length === 0) return [];

    const [rows]: any = await pool.query(
        "SELECT id FROM topics WHERE slug IN (?)",
        [slugs]
    );

    return rows.map((row: any) => row.id);
}
