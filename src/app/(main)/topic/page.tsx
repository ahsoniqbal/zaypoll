import { notFound } from "next/navigation";
import Link from "next/link";

import { getPolls } from "@/services/poll.services";
import {
  getTopicIdsBySlugs,
  getAllTopics,
} from "@/services/topic.service";

import PollFeed from "@/components/poll/PollFeed";
import { getCurrentUser } from "@/lib/server/auth.utils";

type Props = {
  searchParams: Promise<{ topic?: string | string[] }>;
};

export default async function TopicPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  const user = await getCurrentUser();
  const userId = user?.id ?? null;

  // ✅ Normalize topics
  const topicSlugs = Array.isArray(resolvedSearchParams.topic)
    ? resolvedSearchParams.topic
    : resolvedSearchParams.topic
    ? [resolvedSearchParams.topic]
    : [];

  // ✅ Convert slugs → IDs
  const topicIds = await getTopicIdsBySlugs(topicSlugs);

  // ✅ Fetch polls
  const polls = await getPolls(
    userId,
    1,
    10,
    "for_you",
    undefined,
    topicIds
  );

  // ✅ Sidebar topics
  const topics = await getAllTopics();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

      {/* ✅ LEFT CONTENT */}
      <div className="flex-1 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="text-sm text-gray-500">
            Explore polls by topics
          </p>
        </div>

        {/* ✅ Active Filters */}
        {topicSlugs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topicSlugs.map((slug) => (
              <span
                key={slug}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full"
              >
                #{slug}
              </span>
            ))}
          </div>
        )}

        {/* ✅ Polls */}
        {polls.data.length === 0 ? (
          <p className="text-gray-500 text-center">
            No polls found for selected topics.
          </p>
        ) : (
          <PollFeed
            polls={polls.data}
            page={polls.page}
            totalPages={polls.totalPages}
            hasNext={polls.hasNext}
            hasPrev={polls.hasPrev}
            isUserLoggedIn={!!userId}
            basePath="/topic"
            query={{ topic: topicSlugs }}
          />
        )}
      </div>

      {/* ✅ RIGHT SIDEBAR */}
      <aside className="w-64 hidden md:block">
        <div className="sticky top-20 bg-white border rounded-xl p-4 space-y-4">

          <h2 className="font-semibold">Topics</h2>

          <div className="flex flex-col gap-2">

            {topics.map((t: any) => {
              const isActive = topicSlugs.includes(t.slug);

              const nextTopics = isActive
                ? topicSlugs.filter((s) => s !== t.slug)
                : [...topicSlugs, t.slug];

              return (
                <Link
                  key={t.id}
                  href={{
                    pathname: "/topic",
                    query:
                      nextTopics.length > 0
                        ? { topic: nextTopics }
                        : {},
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {t.name}
                </Link>
              );
            })}

          </div>

          {/* ✅ Clear Filters */}
          {topicSlugs.length > 0 && (
            <Link
              href="/topic"
              className="text-sm text-red-500 mt-4 inline-block"
            >
              Clear filters
            </Link>
          )}

        </div>
      </aside>

    </div>
  );
}
``