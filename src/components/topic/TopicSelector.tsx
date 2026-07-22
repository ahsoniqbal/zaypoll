"use client";

import { useMemo, useState, useRef } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { TopicDto } from "@/dto/category.dtos";

type Props = {
  topics: TopicDto[];
  selectedTopics: number[];
  onChange: (topicIds: number[]) => void;
  maxTopics?: number;
};

export default function TopicSelector({
  topics,
  selectedTopics,
  onChange,
  maxTopics = 5,
}: Props) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return [];

    return topics
      .filter(
        (t) =>
          !selectedTopics.includes(t.id) &&
          t.name.toLowerCase().includes(keyword)
      )
      .slice(0, 10);
  }, [topics, selectedTopics, search]);

  const addTopic = (topicId: number) => {
    if (selectedTopics.length >= maxTopics) {
      toast.error(`Maximum ${maxTopics} topics allowed`);
      return;
    }

    onChange([...selectedTopics, topicId]);
    setSearch("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const removeTopic = (topicId: number) => {
    onChange(selectedTopics.filter((id) => id !== topicId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      search === "" &&
      selectedTopics.length > 0
    ) {
      removeTopic(selectedTopics[selectedTopics.length - 1]);
    }
  };

  const selectedTopicObjects = topics.filter((t) =>
    selectedTopics.includes(t.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="topic-search" className="text-sm font-medium">
          Topics <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {selectedTopics.length}/{maxTopics}
        </span>
      </div>

      <div className="relative">
        {/* Input Container */}
        <div
          className="flex flex-wrap gap-2 rounded-xl border bg-background p-2 transition focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
          onClick={() => inputRef.current?.focus()}
        >
          {selectedTopicObjects.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {topic.name}

              <button
                type="button"
                aria-label={`Remove ${topic.name}`}
                onClick={() => removeTopic(topic.id)}
                className="rounded-full outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          <input
            id="topic-search"
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTopics.length === 0
                ? "Search topics..."
                : ""
            }
            className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none"
          />
        </div>

        {/* Suggestions */}
        {search.trim() && (
          <div
            className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl
            border bg-popover shadow-lg"
          >
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <button
                
                  key={topic.id}
                  type="button"
                  onClick={() => addTopic(topic.id)}
                  className="block w-full px-4 py-3 text-left text-sm
                  hover:bg-muted"
                >
                  {topic.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No topics found
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
