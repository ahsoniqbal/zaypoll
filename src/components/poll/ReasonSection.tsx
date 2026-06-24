"use client";

import { useEffect, useState } from "react";
import { CommentDto, PollOptionDto } from "@/dto/poll.dtos";
import { getCommentsByOptionIdAction, addReasonAction, getPollReasonsAction } from "@/actions/poll.actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CommentReactions from "./CommentReactions";
import { format } from "date-fns";
import { Link } from "lucide-react";
import { AppButton } from "../AppButton";

type Props = {
  pollId: number;
  options: PollOptionDto[];
  isUserLoggedIn: boolean;
  hasVoted: boolean;
  userVoteOptionId: number | null;
  hasReason: boolean;
  initialReasons: CommentDto[];
};

export default function ReasonSection({
  pollId,
  options,
  isUserLoggedIn,
  hasVoted,
  userVoteOptionId,
  hasReason,
  initialReasons,
}: Props) {

  const ALL = "all";

  const [selectedOptionId, setSelectedOptionId] = useState<number | "all">(ALL);
  const [sortBy, setSortBy] = useState<"top" | "latest">("top");

  const [commentsMap, setCommentsMap] = useState<Record<string, CommentDto[]>>({
    all_top: initialReasons || [],
  });

  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cacheKey = `${selectedOptionId}_${sortBy}`;
  const comments = commentsMap[cacheKey] || [];

  const selectedOption = selectedOptionId === ALL
    ? null
    : options.find(o => o.id === selectedOptionId);

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

  const handleAddReason = async () => {
    if (!newComment.trim()) return;

    if (!hasVoted) return;

    const text = newComment.trim();

    setIsSubmitting(true);

    const tempKey = `${userVoteOptionId}_${sortBy}`;

    try {
      const res = await addReasonAction(
        pollId,
        Number(userVoteOptionId),
        text
      );

      if (!res.success || !res.data) throw new Error(res.message);

      setNewComment("");

      // refetch correct option
      const optionData = await getPollReasonsAction(pollId,
        Number(userVoteOptionId),
        sortBy
      );

      const allData = await getPollReasonsAction(
        pollId,
        null as any,
        sortBy
      );

      setCommentsMap(prev => ({
        ...prev,
        [tempKey]: optionData || [],
        [`all_${sortBy}`]: allData || [],
      }));

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Add reason */}
      {isUserLoggedIn && hasVoted && (
        <div className="flex items-center gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Why did you choose "${selectedOption?.optionText}"?`}
            className="flex-1 px-4 py-2 text-sm border rounded-full bg-gray-50"
            maxLength={180}
          />

          <AppButton
            // size="sm"
            onClick={handleAddReason}
            disabled={!newComment.trim() || isSubmitting || hasReason || !hasVoted}
            isLoading={isSubmitting}
            loadingText="Adding..."
          >
            Add
          </AppButton>
        </div>
      )}

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