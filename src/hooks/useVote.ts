"use client";

import { useTransition } from "react";
import { castVoteAction } from "@/actions/poll.actions";
import { toast } from "react-hot-toast/headless";

export function useVote(pollId: number) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (optionId: number, reason?: string, isDetailsPage: boolean = false): Promise<boolean> => {
    return new Promise(resolve => {
      startTransition(async () => {
        try {
          const res = await castVoteAction(pollId, optionId, reason, isDetailsPage);

          if (!res.success) {
            toast.error(res.message);
            resolve(false);
            return;
          }

          toast.success(res.message);
          resolve(true);

        } catch {
          toast.error("Something went wrong");
          resolve(false);
        }
      });
    });
  };

  return { handleVote, isPending };
}