"use client";

import { useEffect, useState } from "react";
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

  // =========================
  // FETCH COMMENTS (lazy + cached)
  // =========================
  const fetchComments = async () => {
    if (commentsMap[cacheKey]) return;

    setLoading(true);
    try {
      const optionId =
        selectedOptionId === ALL ? null : Number(selectedOptionId);

      const data = await getPollReasonsAction(pollId, optionId as any, sortBy);

      setCommentsMap(prev => ({
        ...prev,
        [cacheKey]: data || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [selectedOptionId, sortBy]);

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Reasons</h2>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm border rounded-lg px-3 py-1"
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
          onClick={() => setSelectedOptionId(ALL)}
          className={`px-4 py-2 rounded-full text-sm ${selectedOptionId === ALL
            ? "bg-black text-white"
            : "bg-gray-100"
            }`}
        >
          All
        </button>

        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedOptionId(opt.id)}
            className={`px-4 py-2 rounded-full text-sm ${selectedOptionId === opt.id
              ? "bg-black text-white"
              : "bg-gray-100"
              }`}
          >
            {opt.optionText}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">

        {loading && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-center text-gray-400">No reasons yet</p>
        )}

        {comments.map((comment) => (
          <article key={comment.id} className="flex gap-3">

            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>
                {comment.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 bg-gray-50 border rounded-2xl px-4 py-2">

              <p className="font-semibold">
                {comment.user.name}
                <span className="text-sm text-gray-500 ml-2">
                  • {format(new Date(comment.createdAt), "MMM d")}
                </span>
              </p>

              <p className="text-gray-700">{comment.comment}</p>

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
    </div>
  );
}
