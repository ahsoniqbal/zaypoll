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
    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Clock3 className="size-3.5" aria-hidden="true" />
      {isExpired ? (
        "Poll ended"
      ) : (
        <span suppressHydrationWarning>
          Ends in {formatDistanceToNow(parseUtcDate(expiresAt))}
        </span>
      )}
    </p>
  );
}
