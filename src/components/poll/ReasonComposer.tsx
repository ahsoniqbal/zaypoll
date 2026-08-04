"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { addReasonAction } from "@/actions/poll.actions";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type Props = {
  pollId: number;
  optionId: number | null;
  optionText?: string;
  isUserLoggedIn: boolean;
  hasVoted: boolean;
  hasReason: boolean;
  onReasonAdded?: (optionId: number) => void | Promise<void>;
};

export default function ReasonComposer({
  pollId,
  optionId,
  optionText,
  isUserLoggedIn,
  hasVoted,
  hasReason,
  onReasonAdded,
}: Props) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isUserLoggedIn || !hasVoted || !optionId || hasReason) return null;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  const resetHeight = () => {
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const submit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;

    setIsSubmitting(true);
    try {
      const result = await addReasonAction(pollId, optionId, trimmedReason);
      const addedOptionId = result.data?.optionId;
      if (!result.success || !addedOptionId) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setReason("");
      resetHeight();
      setIsExiting(true);
      await new Promise((resolve) => setTimeout(resolve, 200));
      void onReasonAdded?.(addedOptionId);
    } catch {
      toast.error("Could not add your reason. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex w-full items-center gap-2 rounded-4xl border border-input bg-background px-2 duration-200 motion-reduce:animate-none focus-within:border-ring focus-within:ring-[2px] focus-within:ring-ring/50 ${isExiting ? "animate-out fade-out-0 slide-out-to-top-2" : "animate-in fade-in-0 slide-in-from-top-2"}`}>
      <Textarea
        ref={textareaRef}
        id={`reason-${pollId}`}
        aria-label={optionText ? `Why did you choose ${optionText}?` : "Why did you choose this option?"}
        value={reason}
        rows={1}
        onChange={handleChange}
        maxLength={150}
        placeholder={optionText ? `Why did you choose “${optionText}”?` : "Why did you choose this option?"}
        disabled={isSubmitting || isExiting}
        className="min-h-9 max-h-40 resize-none overflow-y-auto rounded-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus:border-transparent focus:ring-0 focus-visible:ring-0"
      />

      {reason.length > 0 && (
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={!reason.trim() || isSubmitting}
          className="shrink-0 rounded-4xl"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      )}
    </div>
  );
}
