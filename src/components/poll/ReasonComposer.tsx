"use client";

import { useState } from "react";
import { addReasonAction } from "@/actions/poll.actions";
import { toast } from "react-hot-toast/headless";
import { useAuthModal } from "@/hooks/useAuthModal";
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

export default function ReasonComposer({ pollId, optionId, optionText, isUserLoggedIn, hasVoted, hasReason, onReasonAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { open } = useAuthModal();

  if (!isUserLoggedIn) {
    return (
      <Button
        type="button"
        onClick={open}
        variant="outline"
        className="w-full justify-start rounded-2xl text-left text-muted-foreground font-medium hover:cursor-pointer"
      >
        Add a reason (optional)
      </Button>
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
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start text-left rounded-2xl px-4 py-2 text-muted-foreground font-medium cursor-pointer h-auto">
        Add a reason
      </Button>
    );
  }

  return (
    <div className="group relative rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-primary overflow-hidden">
      <Textarea
        id={`reason-${pollId}`}
        aria-label={optionText ? `Why did you choose ${optionText}?` : "Why did you choose this option?"}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={150}
        autoFocus
        placeholder={optionText ? `Why did you choose “${optionText}”?` : "Why did you choose this option?"}
        className="min-h-[100px] w-full resize-y border-0 bg-transparent px-3 pt-3 pb-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      
      {/* Absolute overlay at the bottom of the container */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-transparent pointer-events-auto">
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={cancel} 
          disabled={isSubmitting}
          className="h-8 px-3 text-xs"
        >
          Cancel
        </Button>
        <Button 
          type="button"
          size="sm" 
          onClick={submit} 
          disabled={!reason.trim() || isSubmitting}
          className="h-8 px-3 text-xs"
        >
          {isSubmitting ? "Submitting..." : "Submit reason"}
        </Button>
      </div>
    </div>
  );
}
