"use client";

import { toggleCommentReactionAction } from "@/actions/poll.actions";
import { useAuthModal } from "@/hooks/useAuthModal";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
    commentId: number;
    upvotes: number;
    downvotes: number;
    userVote: 1 | -1 | null;
    isUserLoggedIn: boolean;
};

export default function CommentReactions({
    commentId,
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

    const handleReaction = (vote: 1 | -1) => {
        if (!isUserLoggedIn) {
            open();
            return;
        }

        if (isLocked) return;

        setIsLocked(true);

        //SAME LOGIC (reused)
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
                await toggleCommentReactionAction(commentId, vote);
            } finally {
                setIsLocked(false);
            }
        });
    };

    return (
        <div className="flex items-center gap-1 ">

            {/* ✅ Upvote */}
            <button type="button" onClick={() => handleReaction(1)}
                aria-label="Upvote reason"
                aria-pressed={state.reaction === 1}
                className={`flex items-center justify-center h-7 w-7 rounded-full transition-all
                ${state.reaction === 1
                        ? "text-orange-600"
                        : "text-muted-foreground hover:bg-muted hover:text-orange-500"}
                    active:scale-90`}>
                <ArrowBigUp className="w-5 h-5" />
            </button>

            {/* ✅ Score */}
            <span className="min-w-4 text-center text-xs font-medium tabular-nums text-muted-foreground">
                {state.upvotes - state.downvotes}
            </span>

            {/* ✅ Downvote */}
            <button type="button" onClick={() => handleReaction(-1)}
                aria-label="Downvote reason"
                aria-pressed={state.reaction === -1}
                className={`flex items-center justify-center h-7 w-7 rounded-full transition-all
                ${state.reaction === -1
                        ? "text-blue-600"
                        : "text-muted-foreground hover:bg-muted hover:text-blue-500"}
                    active:scale-90`}>
                <ArrowBigDown className="w-5 h-5" />
            </button>

        </div>
    );
}
