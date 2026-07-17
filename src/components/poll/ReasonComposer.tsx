"use client";

import { useState } from "react";
import { addReasonAction } from "@/actions/poll.actions";
import { AppButton } from "../AppButton";
import { toast } from "react-hot-toast/headless";
import { useAuthModal } from "@/hooks/useAuthModal";

type Props = {
  pollId: number;
  optionId: number | null;
  optionText?: string;
  isUserLoggedIn: boolean;
  hasVoted: boolean;
  hasReason: boolean;
  onReasonAdded?: (optionId: number) => void | Promise<void>;
};

export default function ReasonComposer({ pollId, optionId, optionText, isUserLoggedIn, hasVoted, hasReason, onReasonAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { open } = useAuthModal();

  if (!isUserLoggedIn) {
    return (
      <button
        type="button"
        onClick={open}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        Add a reason (optional)
      </button>
    );
  }

  if (!hasVoted || !optionId || hasReason) return null;

  const cancel = () => {
    setReason("");
    setIsOpen(false);
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
      cancel();
      void onReasonAdded?.(addedOptionId);
    } catch {
      toast.error("Could not add your reason. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        Add a reason (optional)
      </button>
    );
  }

  return (
    <div>
      <textarea
        id={`reason-${pollId}`}
        aria-label={optionText ? `Why did you choose ${optionText}?` : "Why did you choose this option?"}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={150}
        autoFocus
        placeholder={optionText ? `Why did you choose “${optionText}”?` : "Why did you choose this option?"}
        className="min-h-24 w-full resize-y rounded-md border-2 border-gray-400 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gray-800 focus:ring-1 focus:ring-gray-800"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <AppButton variant="ghost" size="sm" onClick={cancel} disabled={isSubmitting}>Cancel</AppButton>
        <AppButton size="sm" onClick={submit} disabled={!reason.trim() || isSubmitting} isLoading={isSubmitting} loadingText="Submitting...">Submit reason</AppButton>
      </div>
    </div>
  );
}
