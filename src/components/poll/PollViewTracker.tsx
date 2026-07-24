"use client";

import { useEffect } from "react";

export default function PollViewTracker({ pollId }: { pollId: number }) {
  useEffect(() => {
    void fetch(`/api/polls/${pollId}/view`, {
      method: "POST",
      keepalive: true,
    }).catch((error) => {
      // Analytics must never interrupt the poll experience. The endpoint also
      // deduplicates repeated development-mode effect calls on the server.
      console.error("Poll view tracking failed", error);
    });
  }, [pollId]);
  return null;
}
