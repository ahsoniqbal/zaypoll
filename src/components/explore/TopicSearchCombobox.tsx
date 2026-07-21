"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopicDto } from "@/dto/category.dtos";

type Props = {
  topics: TopicDto[];
};

export default function TopicSearchCombobox({ topics }: Props) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];

    return topics
      .filter((topic) => topic.name.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [query, topics]);

  const showResults = isFocused && query.trim().length > 0;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      router.push(`/topics/${results[activeIndex].slug}`);
    }
  };

  return (
    <div className="relative mt-5">
      <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Search topics like AI, Sports, or Cricket"
        role="combobox"
        aria-expanded={showResults}
        aria-controls="topic-search-results"
        aria-activedescendant={activeIndex >= 0 ? `topic-result-${results[activeIndex]?.id}` : undefined}
        className="h-12 w-full rounded-xl border bg-background pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      {showResults && (
        <div id="topic-search-results" role="listbox" className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-background p-1 shadow-lg">
          {results.length > 0 ? results.map((topic, index) => (
            <Link
              key={topic.id}
              id={`topic-result-${topic.id}`}
              href={`/topics/${topic.slug}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm hover:bg-muted ${index === activeIndex ? "bg-muted" : ""}`}
            >
              <span className="font-medium text-foreground">{topic.name}</span>
              <span className="text-xs text-muted-foreground">
                {topic.parentName ? `${topic.parentName} · Sub-topic` : "Main topic"}
              </span>
            </Link>
          )) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">No topics found.</p>
          )}
        </div>
      )}
    </div>
  );
}
