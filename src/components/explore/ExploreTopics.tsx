"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TopicDto } from "@/dto/category.dtos";


type Props = {
  topics: TopicDto[];
};


export default function ExploreTopics({ topics }: Props) {
  const [query, setQuery] = useState("");

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return topics;
    return topics.filter((t: any) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, topics]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

      {/* ================= SEARCH (INLINE) ================= */}
      <section>
        <div className="rounded-2xl border bg-gradient-to-r from-green-50 to-white p-6 shadow-sm">

          <div className="text-lg font-semibold text-gray-900">
            Explore Topics
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Search and discover what people are talking about
          </p>

          {/* SEARCH INPUT (LOCAL ONLY) */}
          <div className="mt-4 flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
            <Search size={18} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics like AI, Sports, Gaming..."
              className="w-full outline-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* ================= TOPICS ================= */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {query ? "Search Results" : "Popular Topics"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredTopics.slice(0, 30).map((topic: any) => (
            <Link
              key={topic.id}
              href={{
                pathname: "/topic",
                query: { topic: topic.slug },
              }}
              className="
                px-4 py-2
                rounded-full
                border
                bg-white
                text-sm
                font-medium
                text-gray-800
                hover:bg-green-50
                hover:border-green-500
                transition
              "
            >
              {topic.name}
            </Link>
          ))}
        </div>

        {/* NO RESULTS STATE */}
        {filteredTopics.length === 0 && (
          <div className="text-sm text-muted-foreground mt-6">
            No topics found for "{query}"
          </div>
        )}
      </section>

    </div>
  );
}