import { Metadata } from "next";
import { getParentTopics, getSearchableTopics } from "@/services/topic.service";
import { getTrendingPolls } from "@/services/poll.services";

import PollCard from "@/components/poll/PollCard";
import { auth } from "@/auth";
import ExploreTopics from "@/components/explore/ExploreTopics";

export const metadata: Metadata = {
  title: "Explore topics",
  description: "Discover public polling communities and the conversations trending in each topic.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [parentTopics, searchableTopics, trendingPolls] = await Promise.all([
    getParentTopics(),
    getSearchableTopics(),
    getTrendingPolls(userId),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-1 py-6 sm:px-4 sm:py-8">

      <ExploreTopics parentTopics={parentTopics} searchableTopics={searchableTopics} />

      {/* ================= TRENDING POLLS ================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Trending Polls
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Most active discussions right now
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {trendingPolls.map((poll) => (
            <PollCard
              key={poll.pollId}
              poll={poll}
              isUserLoggedIn={!!userId}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
