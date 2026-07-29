"use client";

import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";

import type { TopicDto } from "@/dto/category.dtos";

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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTopicObjects = topics.filter((topic) =>
    selectedTopics.includes(topic.id),
  );

  const suggestions = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return [];

    return topics
      .filter(
        (topic) =>
          !selectedTopics.includes(topic.id) &&
          (topic.name.toLocaleLowerCase().includes(keyword) ||
            topic.parentName?.toLocaleLowerCase().includes(keyword)),
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLocaleLowerCase().startsWith(keyword);
        const bStartsWith = b.name.toLocaleLowerCase().startsWith(keyword);
        if (aStartsWith !== bStartsWith) return aStartsWith ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [search, selectedTopics, topics]);

  const addTopic = (topicId: number) => {
    if (selectedTopics.length >= maxTopics) {
      toast.error(`You can select up to ${maxTopics} topics`);
      return;
    }

    onChange([...selectedTopics, topicId]);
    setSearch("");
    inputRef.current?.focus();
  };

  const removeTopic = (topicId: number) => {
    onChange(selectedTopics.filter((id) => id !== topicId));
  };

  const showSuggestions = isFocused && search.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label htmlFor="topic-search" className="text-sm font-medium">
            Topics <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          {/* <p className="text-xs text-muted-foreground">
            Add up to {maxTopics} tags to help people discover your poll
          </p> */}
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {selectedTopics.length}/{maxTopics}
        </span>
      </div>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          id="topic-search"
          type="text"
          value={search}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearch("");
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              if (suggestions[0]) addTopic(suggestions[0].id);
            }
          }}
          disabled={selectedTopics.length >= maxTopics}
          placeholder={
            selectedTopics.length >= maxTopics
              ? `Maximum ${maxTopics} topics selected`
              : "Type to search topics"
          }
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="topic-suggestions"
          className="w-full rounded-xl border bg-background py-3 pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted/40"
        />

        {showSuggestions && (
          <div
            id="topic-suggestions"
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            {suggestions.length > 0 ? (
              suggestions.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addTopic(topic.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <span className="truncate text-sm font-medium">{topic.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {topic.parentName ? `${topic.parentName} · Subtopic` : "Main topic"}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No topics found
              </p>
            )}
          </div>
        )}
      </div>

      {selectedTopicObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Selected topics">
          {selectedTopicObjects.map((topic) => (
            <span
              key={topic.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <span className="truncate">{topic.name}</span>
              <button
                type="button"
                aria-label={`Remove ${topic.name}`}
                onClick={() => removeTopic(topic.id)}
                className="shrink-0 cursor-pointer rounded-full p-0.5 transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
