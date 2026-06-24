import Link from "next/link";
import { Search } from "lucide-react";

import { getAllTopics } from "@/services/topic.service";
import { getTrendingPolls } from "@/services/poll.services";

import PollCard from "@/components/poll/PollCard";
import { auth } from "@/auth";
import ExploreTopics from "@/components/explore/ExploreTopics";

export default async function ExplorePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const topics = await getAllTopics();
  const trendingPolls = await getTrendingPolls(userId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

     <ExploreTopics topics={topics}  />

      {/* ================= TRENDING POLLS ================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Trending Polls
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            Most active discussions right now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingPolls.map((poll) => (
            <PollCard
              key={poll.pollId}
              poll={poll}
              isUserLoggedIn={!!userId}
            />
          ))}
        </div>
      </section>

    
    </div>
  );
}