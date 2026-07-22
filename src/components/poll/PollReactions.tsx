"use client";

import { toggleReactionAction } from "@/actions/poll.actions";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useState, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";


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

    return (
        <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">

            <button
                type="button"
                aria-label="Upvote poll"
                aria-pressed={state.reaction === 1}
                onClick={(e) => handleReaction(e, 1)}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all
                ${state.reaction === 1
                        ? "bg-orange-100 text-orange-600"
                        : "text-muted-foreground hover:bg-background hover:text-orange-500"} `}
            >
                <ArrowBigUp className="w-5 h-5" />
            </button>
 
            <span className="min-w-5 text-center text-xs font-medium tabular-nums">
                {state.upvotes - state.downvotes}
            </span>

            <button
                type="button"
                aria-label="Downvote poll"
                aria-pressed={state.reaction === -1}
                onClick={(e) => handleReaction(e, -1)}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all
            ${state.reaction === -1
                        ? "bg-blue-100 text-blue-600"
                        : "text-muted-foreground hover:bg-background hover:text-blue-500"}`}
            >
                <ArrowBigDown className="w-5 h-5" />
            </button>

        </div>

    );
}
