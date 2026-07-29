import Link from "next/link";

import { formatCompactNumber } from "@/lib/utils";

type Props = {
    pollId: number;
    reasonCount: number;
    isDisabled?: boolean;
};

const buttonClasses =
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border " +
  "bg-background px-2 text-xs font-semibold text-foreground " +
  "transition-colors hover:bg-muted " +
  "disabled:pointer-events-none disabled:opacity-50";
  
function ReasonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.6}
      stroke="currentColor"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  );
}

export default function PollCommentButton({
    pollId,
    reasonCount,
    isDisabled = false,
}: Props) {
    const formattedCount = formatCompactNumber(reasonCount);
    const reasonLabel = reasonCount === 1 ? "reason" : "reasons";
    const ariaLabel = `View ${reasonCount} ${reasonLabel}`;

    const content = (
        <>
            <ReasonIcon />

            <span
                className="leading-none tabular-nums"
                title={reasonCount.toLocaleString()}
            >
                {formattedCount}
            </span>
        </>
    );

    if (isDisabled) {
        return (
            <button
                type="button"
                disabled
                aria-label={ariaLabel}
                className={buttonClasses}
            >
                {content}
            </button>
        );
    }

    return (
        <Link
            href={`/polls/${pollId}`}
            aria-label={ariaLabel}
            className={buttonClasses}
        >
            {content}
        </Link>
    );
}