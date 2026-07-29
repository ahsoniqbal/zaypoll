"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock3 } from "lucide-react";
import { parseUtcDate } from "@/lib/utils";

type Props = {
  expiresAt: string | null;
  isExpired: boolean;
};

export default function PollExpiryStatus({ expiresAt, isExpired }: Props) {
  if (!expiresAt) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <Clock3 className="size-3.5" aria-hidden="true" />
      {isExpired ? (
        "Poll ended"
      ) : (
        <span suppressHydrationWarning>
          Ends in {formatDistanceToNow(parseUtcDate(expiresAt))}
        </span>
      )}
    </span>
  );
}
