import type { MetadataRoute } from "next";
import { getSearchableTopics } from "@/services/topic.service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const topics = await getSearchableTopics();
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/explore"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "/" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...topics.map((topic) => ({
      url: new URL(`/topics/${topic.slug}`, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: topic.parentId ? 0.6 : 0.7,
    })),
  ];
}
