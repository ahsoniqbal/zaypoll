"use client";

import { toggleReactionAction } from "@/actions/poll.actions";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useState, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";


type Props = {
    pollId: number;
    upvotes: number;
    downvotes: number;
    userVote: 1 | -1 | null;
    isUserLoggedIn: boolean;
};

export default function PollReactions({
    pollId,
    upvotes,
    downvotes,
    userVote,
    isUserLoggedIn,
}: Props) {
    const [, startTransition] = useTransition();
    const [isLocked, setIsLocked] = useState(false);
    const { open } = useAuthModal();

    const [state, setState] = useState({
        reaction: userVote,
        upvotes,
        downvotes,
    });


    const handleReaction = (e: React.MouseEvent<HTMLButtonElement>, vote: 1 | -1) => {
        e.stopPropagation();
        if (!isUserLoggedIn) {
            open(); //show login modal
            return;
        }

        if (isLocked) return;

        setIsLocked(true);

        //optimistic UI update
        setState((prev) => {
            const { reaction } = prev;
            let { upvotes, downvotes } = prev;

            if (reaction === vote) {
                if (vote === 1) upvotes--;
                else downvotes--;
                return { reaction: null, upvotes, downvotes };
            }

            if (reaction === null) {
                if (vote === 1) upvotes++;
                else downvotes++;
                return { reaction: vote, upvotes, downvotes };
            }

            if (reaction === 1) {
                upvotes--;
                downvotes++;
            } else {
                downvotes--;
                upvotes++;
            }

            return { reaction: vote, upvotes, downvotes };
        });

        startTransition(async () => {
            try {
                await toggleReactionAction(pollId, vote);
            } finally {
                setIsLocked(false);
            }
        });
    };
    const netVotes = state.upvotes - state.downvotes;
    return (
        <div className="inline-flex h-8 items-center rounded-full border bg-background p-0.5">
            <button
                type="button"
                aria-label="Upvote poll"
                aria-pressed={state.reaction === 1}
                onClick={(event) => handleReaction(event, 1)}
                className={`flex size-7 items-center justify-center rounded-full transition-colors ${state.reaction === 1
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    }`}
            >
                <ArrowBigUp className="size-4" aria-hidden="true" />
            </button>

            <span
                className="min-w-3 text-center text-xs font-semibold leading-none tabular-nums"
                title={netVotes.toLocaleString()}
                aria-label={`${netVotes} net votes`}
            >
                {formatCompactNumber(netVotes)}
            </span>

            <button
                type="button"
                aria-label="Downvote poll"
                aria-pressed={state.reaction === -1}
                onClick={(event) => handleReaction(event, -1)}
                className={`flex size-7 items-center justify-center rounded-full transition-colors ${state.reaction === -1
                        ? "bg-blue-600/10 text-blue-600"
                        : "text-foreground hover:bg-muted hover:text-blue-600"
                    }`}
            >
                <ArrowBigDown className="size-4" aria-hidden="true" />
            </button>
        </div>

    );
}
