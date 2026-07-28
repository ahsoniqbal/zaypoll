"use client";

import { useTransition } from "react";
import { castVoteAction } from "@/actions/poll.actions";
import { toast } from "react-hot-toast/headless";
import type { ActionResponse } from "@/types/common.types";

export function useVote(pollId: number) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (
    optionId: number,
    isDetailsPage: boolean = false,
  ): Promise<ActionResponse<{ optionId: number }>> => {
    return new Promise(resolve => {
      startTransition(async () => {
        try {
          const res = await castVoteAction(pollId, optionId, isDetailsPage);

          if (!res.success) {
            toast.error(res.message);
            resolve(res);
            return;
          }

          toast.success(res.message);
          resolve(res);

        } catch {
          toast.error("Something went wrong");
          resolve({ success: false, message: "Something went wrong" });
        }
      });
    });
  };

  return { handleVote, isPending };
}
