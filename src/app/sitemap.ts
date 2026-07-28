import type { MetadataRoute } from "next";
import { getSearchableTopics } from "@/services/topic.service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/explore"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    const topics = await getSearchableTopics();

    return [
      ...staticRoutes,
      ...topics.map((topic) => ({
        url: new URL(`/topics/${topic.slug}`, siteUrl).toString(),
        changeFrequency: "weekly" as const,
        priority: topic.parentId ? 0.6 : 0.7,
      })),
    ];
  } catch (error) {
    console.error("Unable to load dynamic sitemap topics:", error);
  }

  // Keep the sitemap available when the database is temporarily unreachable.
  return [
    ...staticRoutes,
  ];
}
