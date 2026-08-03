"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareText, LucideSortDesc } from "lucide-react";
import { CommentDto, PollOptionDto } from "@/dto/poll.dtos";
import { getPollReasonsAction } from "@/actions/poll.actions";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import CommentReactions from "./CommentReactions";
import ReasonComposer from "./ReasonComposer";

type Props = {
  pollId: number;
  options: PollOptionDto[];
  isUserLoggedIn: boolean;
  hasVoted: boolean;
  userVoteOptionId: number | null;
  hasReason: boolean;
  onReasonAdded: () => void;
  initialReasons: CommentDto[];
};

const ALL = "all";
type OptionFilter = number | typeof ALL;
type ReasonSort = "top" | "latest";

export default function ReasonSection({
  pollId,
  options,
  isUserLoggedIn,
  hasVoted,
  userVoteOptionId,
  hasReason,
  onReasonAdded,
  initialReasons,
}: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<OptionFilter>(ALL);
  const [sortBy, setSortBy] = useState<ReasonSort>("top");
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentDto[]>>({
    all_top: initialReasons || [],
  });
  const [loading, setLoading] = useState(false);

  const cacheKey = `${selectedOptionId}_${sortBy}`;
  const comments = commentsMap[cacheKey] || [];

  const refreshReasonCaches = async (optionId: number) => {
    setLoading(true);
    try {
      const [allReasons, optionReasons] = await Promise.all([
        getPollReasonsAction(pollId, null, sortBy),
        getPollReasonsAction(pollId, optionId, sortBy),
      ]);

      setCommentsMap((previous) => {
        const next = { ...previous };
        delete next.all_top;
        delete next.all_latest;
        delete next[`${optionId}_top`];
        delete next[`${optionId}_latest`];
        next[`all_${sortBy}`] = allReasons;
        next[`${optionId}_${sortBy}`] = optionReasons;
        return next;
      });

      onReasonAdded();
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (option: OptionFilter, sort: ReasonSort) => {
    const nextCacheKey = `${option}_${sort}`;
    if (commentsMap[nextCacheKey]) return;

    setLoading(true);
    try {
      const optionId = option === ALL ? null : option;
      const data = await getPollReasonsAction(pollId, optionId, sort);
      setCommentsMap((previous) => ({
        ...previous,
        [nextCacheKey]: data || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (option: OptionFilter) => {
    setSelectedOptionId(option);
    void loadComments(option, sortBy);
  };

  const changeSort = (sort: ReasonSort) => {
    setSortBy(sort);
    void loadComments(selectedOptionId, sort);
  };

  const getChipClasses = (isSelected: boolean) =>
    [
      "max-w-full whitespace-nowrap rounded-md border px-2.5 py-1.5",
      "inline-flex items-center",
      "text-xs font-semibold text-foreground",
      "cursor-pointer transition-colors hover:bg-secondary",
      isSelected
        ? "border-neutral-300 bg-secondary"
        : "border-border bg-background",
    ].join(" ");

  return (
    <section className="space-y-4">


      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reasons</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted/50 hover:text-foreground">
          <LucideSortDesc className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Sort</span>
          <select
            value={sortBy}
            aria-label="Sort reasons"
            onChange={(event) => changeSort(event.target.value as ReasonSort)}
            className="cursor-pointer bg-transparent text-foreground outline-none"
          >
            <option value="top">Top</option>
            <option value="latest">Newest</option>
          </select>
        </label>
      </div>

      <ReasonComposer
        pollId={pollId}
        optionId={userVoteOptionId}
        optionText={options.find((option) => option.id === userVoteOptionId)?.optionText}
        isUserLoggedIn={isUserLoggedIn}
        hasVoted={hasVoted}
        hasReason={hasReason}
        alwaysExpanded
        onReasonAdded={refreshReasonCaches}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectOption(ALL)}
          aria-pressed={selectedOptionId === ALL}
          className={getChipClasses(selectedOptionId === ALL)}
        >
          All
        </button>

        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => selectOption(option.id)}
            aria-pressed={selectedOptionId === option.id}
            className={getChipClasses(selectedOptionId === option.id)}
          >
            <span className="truncate">{option.optionText}</span>
          </button>
        ))}
      </div>



      <div>
        {loading && (
          <div role="status" className="space-y-3 p-4">
            <span className="sr-only">Loading reasons…</span>
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="px-5 py-12 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareText className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium">No reasons yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first voter to explain your choice.
            </p>
          </div>
        )}

        {!loading &&
          comments.map((comment) => {
            const selectedOption = options.find(
              (option) => option.id === comment.optionId
            );

            return (
              <article
                key={comment.id}

              >
                <div className="group flex gap-2 py-1 transition-colors hover:bg-muted/25 sm:py-2">
                  <Link
                    href={`/user/${encodeURIComponent(comment.user.userName)}`}
                    aria-label={`View ${comment.user.name}'s profile`}
                    className="h-fit shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Avatar className="size-9">
                      {comment.user.image && (
                        <AvatarImage
                          src={comment.user.image}
                          alt={`${comment.user.name}'s profile`}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(comment.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="rounded-xl border border-border bg-background px-4 py-2 transition-colors">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <Link
                          href={`/user/${encodeURIComponent(comment.user.userName)}`}
                          className="text-sm font-semibold hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {comment.user.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          • {formatRelativeTime(comment.createdAt)}
                        </span>
                        {selectedOptionId === ALL && (
                          <Badge
                            variant="default"
                            title={selectedOption?.optionText ?? "Unknown option"}
                            aria-label={`Selected option: ${selectedOption?.optionText ?? "Unknown option"}`}
                            className="max-w-28 border-primary/20 bg-primary/8 text-primary sm:max-w-36"
                          >
                            <span className="truncate">
                              {selectedOption?.optionText ?? "Unknown option"}
                            </span>
                          </Badge>
                        )}
                      </div>

                      <p className="mt-2 break-words text-sm leading-6 text-foreground/90">
                        {comment.comment}
                      </p>

                    </div>
                    <div className="mt-1 flex">
                      <CommentReactions
                        commentId={comment.id}
                        upvotes={comment.upvotes}
                        downvotes={comment.downvotes}
                        userVote={comment.userReaction}
                        isUserLoggedIn={isUserLoggedIn}
                      />
                    </div>
                  </div>
                </div>
              </article>

            );
          })}
      </div>
    </section>
  );
}
