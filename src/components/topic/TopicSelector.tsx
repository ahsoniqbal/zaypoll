"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Search, Tags, X } from "lucide-react";
import toast from "react-hot-toast";

import type { TopicDto } from "@/dto/category.dtos";
import { Button } from "@/components/ui/button";

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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const mainTopics = useMemo(
    () => topics.filter((topic) => topic.parentId == null),
    [topics],
  );

  const visibleTopics = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return mainTopics;
    return mainTopics.filter((topic) =>
      topic.name.toLocaleLowerCase().includes(keyword),
    );
  }, [mainTopics, search]);

  const selectedTopicObjects = mainTopics.filter((topic) =>
    selectedTopics.includes(topic.id),
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setSearch("");
  };

  const toggleTopic = (topicId: number) => {
    if (selectedTopics.includes(topicId)) {
      onChange(selectedTopics.filter((id) => id !== topicId));
      return;
    }

    if (selectedTopics.length >= maxTopics) {
      toast.error(`You can select up to ${maxTopics} topics`);
      return;
    }

    onChange([...selectedTopics, topicId]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            Topics <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Select between 1 and {maxTopics} main topics
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {selectedTopics.length}/{maxTopics}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-xl border bg-background px-4 py-3 text-left transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Tags className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">
            {selectedTopics.length > 0 ? "Edit selected topics" : "Choose topics"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {selectedTopics.length > 0
              ? selectedTopicObjects.map((topic) => topic.name).join(", ")
              : "Add at least one topic to your poll"}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {selectedTopicObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Selected topics">
          {selectedTopicObjects.map((topic) => (
            <span
              key={topic.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {topic.name}
              <button
                type="button"
                aria-label={`Remove ${topic.name}`}
                onClick={() => toggleTopic(topic.id)}
                className="rounded-full p-0.5 transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-dialog-title"
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl ring-1 ring-foreground/10 sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 id="topic-dialog-title" className="font-semibold">Choose topics</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select up to {maxTopics} topics for this poll
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close topic selector"
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border-b p-3">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search main topics"
                  aria-label="Search main topics"
                  className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {visibleTopics.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {visibleTopics.map((topic) => {
                    const selected = selectedTopics.includes(topic.id);
                    const disabled = !selected && selectedTopics.length >= maxTopics;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        disabled={disabled}
                        aria-pressed={selected}
                        className={`flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background text-xs font-semibold text-primary ring-1 ring-foreground/10">
                          {topic.iconUrl ? (
                            // Icon hosts are stored in the database and may vary.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={topic.iconUrl} alt="" className="size-5 object-contain" />
                          ) : (
                            topic.name.slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {topic.name}
                        </span>
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                          }`}
                        >
                          {selected && <Check className="size-3" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No main topics match “{search.trim()}”
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {selectedTopics.length} of {maxTopics} selected
              </p>
              <Button type="button" onClick={closeModal} disabled={selectedTopics.length === 0}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
