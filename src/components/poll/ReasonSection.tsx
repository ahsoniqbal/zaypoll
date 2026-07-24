"use client";

import { useState } from "react";
import { CommentDto, PollOptionDto } from "@/dto/poll.dtos";
import { getPollReasonsAction } from "@/actions/poll.actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CommentReactions from "./CommentReactions";
import { format } from "date-fns";
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

  const ALL = "all";

  const [selectedOptionId, setSelectedOptionId] = useState<number | "all">(ALL);
  const [sortBy, setSortBy] = useState<"top" | "latest">("top");

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

        // A new reason affects only All and the option it belongs to. Keep every
        // other option's cached list, and refresh the alternate sort on demand.
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

  const loadComments = async (
    option: number | "all",
    sort: "top" | "latest"
  ) => {
    const nextCacheKey = `${option}_${sort}`;
    if (commentsMap[nextCacheKey]) return;
    setLoading(true);
    try {
      const optionId = option === ALL ? null : option;
      const data = await getPollReasonsAction(pollId, optionId, sort);

      setCommentsMap(prev => ({
        ...prev,
        [nextCacheKey]: data || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (option: number | "all") => {
    setSelectedOptionId(option);
    void loadComments(option, sortBy);
  };

  const changeSort = (sort: "top" | "latest") => {
    setSortBy(sort);
    void loadComments(selectedOptionId, sort);
  };

  // =========================
  // UI
  // =========================
  return (
    <section className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Reasons</h2>

        <select
          value={sortBy}
          aria-label="Sort reasons"
          onChange={(e) => changeSort(e.target.value as "top" | "latest")}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          <option value="top">Top</option>
          <option value="latest">Latest</option>
        </select>
      </div>

      <ReasonComposer
        pollId={pollId}
        optionId={userVoteOptionId}
        optionText={options.find((option) => option.id === userVoteOptionId)?.optionText}
        isUserLoggedIn={isUserLoggedIn}
        hasVoted={hasVoted}
        hasReason={hasReason}
        onReasonAdded={refreshReasonCaches}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => selectOption(ALL)}
          type="button"
          aria-pressed={selectedOptionId === ALL}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${selectedOptionId === ALL
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
        >
          All
        </button>

        {options.map((opt) => (
          <button
            type="button"
            key={opt.id}
            onClick={() => selectOption(opt.id)}
            aria-pressed={selectedOptionId === opt.id}
            className={`max-w-full truncate rounded-full px-3 py-1.5 text-sm transition-colors ${selectedOptionId === opt.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            {opt.optionText}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">

        {loading && (
          <div role="status" className="space-y-3 py-2"><span className="sr-only">Loading reasons…</span>{[1,2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />)}</div>
        )}

        {!loading && comments.length === 0 && (
          <div className="rounded-xl border border-dashed px-5 py-10 text-center"><p className="text-sm font-medium">No reasons yet</p><p className="mt-1 text-sm text-muted-foreground">Be the first voter to explain your choice.</p></div>
        )}

        {comments.map((comment) => (
          <article key={comment.id} className="flex gap-3">

            <Avatar>
              {comment.user.image && <AvatarImage src={comment.user.image} alt={`${comment.user.name}'s profile`} />}
              <AvatarFallback>
                {comment.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 rounded-2xl bg-muted/60 px-4 py-3">

              <p className="text-sm font-medium">
                {comment.user.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  • {format(new Date(comment.createdAt), "MMM d")}
                </span>
              </p>

              <p className="mt-1 break-words text-sm leading-6 text-foreground">{comment.comment}</p>

              <div className="mt-2">
                <CommentReactions
                  commentId={comment.id}
                  upvotes={comment.upvotes}
                  downvotes={comment.downvotes}
                  userVote={comment.userReaction}
                  isUserLoggedIn={isUserLoggedIn}
                />
              </div>

            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
