"use client";

import { PollListingDto } from "@/dto/poll.dtos";
import PollHeader from "./PollHeader";
import PollOptions from "./PollOptions";
import PollReactions from "./PollReactions";
import { useVote } from "@/hooks/useVote";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PollCommentButton from "./PollCommentButton";
import { AppButton } from "../AppButton";
import ReasonComposer from "./ReasonComposer";
import { useAuthModal } from "@/hooks/useAuthModal";
import { usePollExpiry } from "@/hooks/usePollExpiry";
import PollExpiryStatus from "./PollExpiryStatus";
import { formatCompactNumber } from "@/lib/utils";

type Props = {
    poll: PollListingDto;
    isUserLoggedIn: boolean;
};

export default function PollCard({ poll, isUserLoggedIn }: Props) {
    const { handleVote, isPending } = useVote(poll.pollId);
    const { open } = useAuthModal();

    const [selectedOption, setSelectedOption] = useState<number | null>(null); //option id before showing results
    const router = useRouter();

    const [options, setOptions] = useState(poll.options);
    const [totalVotes, setTotalVotes] = useState(poll.totalVotes);
    const [hasVoted, setHasVoted] = useState(poll.hasVoted);
    const [userVoteOptionId, setUserVoteOptionId] = useState(poll.userVoteOptionId);
    const [hasReason, setHasReason] = useState(poll.hasReason);
    const [serverExpired, setServerExpired] = useState(false);
    const hasReachedExpiry = usePollExpiry(poll.expiresAt, poll.isExpired);
    const isExpired = serverExpired || hasReachedExpiry;
    const showReasonComposer =
        !isExpired &&
        (!isUserLoggedIn || (hasVoted && userVoteOptionId != null && !hasReason));

    const onClickVoteButton = async () => {
        if (!selectedOption || isPending || hasVoted || isExpired) return;

        if (!isUserLoggedIn) {
            open();
            return;
        }


        // Save previous state (for rollback)
        const prevOptions = options;
        const prevTotalVotes = totalVotes;
        const prevHasVoted = hasVoted;
        const prevUserVoteOptionId = userVoteOptionId;

        //OPTIMISTIC UPDATE
        setHasVoted(true);
        setUserVoteOptionId(selectedOption);

        setOptions(prev =>
            prev.map(opt =>
                opt.id === selectedOption
                    ? { ...opt, voteCount: opt.voteCount + 1 }
                    : opt
            )
        );
        setTotalVotes(prev => prev + 1);

        setSelectedOption(null);
        try {
            const result = await handleVote(selectedOption);

            // ROLLBACK if failed
            if (!result.success) {
                setOptions(prevOptions);
                setTotalVotes(prevTotalVotes);
                setHasVoted(prevHasVoted);
                setUserVoteOptionId(prevUserVoteOptionId);
                if (result.message.toLowerCase().includes("poll has ended")) {
                    setServerExpired(true);
                }
            }

        } catch {
            // ROLLBACK if error
            setOptions(prevOptions);
            setTotalVotes(prevTotalVotes);
            setHasVoted(prevHasVoted);
            setUserVoteOptionId(prevUserVoteOptionId);
        }

    }
    // hover:-translate-y-px
    return (
        <article className="surface-card cursor-pointer transition-all hover:ring-primary/20 hover:shadow-md p-3 sm:p-3"
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("input, button, textarea, a, label")) return; //Ignore clicks on interactive elements

                router.push(`/polls/${poll.pollId}`);
            }}>

            <PollHeader
                username={poll.user.userName}
                name={poll.user.name}
                image={poll.user.image}
                createdAt={poll.createdAt}
            />

            <div className="mb-4 mt-3">
                {poll.title && (
                    <h2 className="mb-1 text-base font-semibold leading-snug text-foreground">{poll.title}</h2>
                )}
                {poll.content && (
                    <p className="text-sm leading-6 text-muted-foreground">{poll.content}</p>
                )}
            </div>

            <PollOptions
                options={options}
                hasVoted={hasVoted}
                userVoteOptionId={userVoteOptionId}
                totalVotes={totalVotes}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
                isExpired={isExpired}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                <span
                    className="tabular-nums"
                    title={`${totalVotes.toLocaleString()} ${totalVotes === 1 ? "vote" : "votes"}`}
                >
                    {formatCompactNumber(totalVotes)} {totalVotes === 1 ? "vote" : "votes"}
                </span>
                {poll.expiresAt && (
                    <>
                        <span aria-hidden="true">•</span>
                        <PollExpiryStatus expiresAt={poll.expiresAt} isExpired={isExpired} />
                    </>
                )}
            </div>



            {/* Reactions, reasons and vote button */}
            <div
                className="mt-3 flex min-h-9 items-center justify-between gap-3 border-t pt-3"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex h-8 items-center gap-2">
                    <PollReactions
                        pollId={poll.pollId}
                        upvotes={poll.upvotes}
                        downvotes={poll.downvotes}
                        userVote={poll.userReaction}
                        isUserLoggedIn={isUserLoggedIn}
                    />

                    <PollCommentButton
                        pollId={poll.pollId}
                        reasonCount={poll.reasonCount}
                    />
                </div>

                <AppButton
                    size="sm"
                    className="h-8 shrink-0 px-4"
                    onClick={onClickVoteButton}
                    disabled={!selectedOption || isPending || hasVoted || isExpired}
                    isLoading={isPending}
                    loadingText="Voting..."
                >
                    {isExpired ? "Poll ended" : "Vote"}
                </AppButton>
            </div>
            {showReasonComposer && (
                <div
                    className="mx-auto mt-4 w-full"
                    onClick={(event) => event.stopPropagation()}
                >
                    <ReasonComposer
                        pollId={poll.pollId}
                        optionId={userVoteOptionId}
                        optionText={options.find((option) => option.id === userVoteOptionId)?.optionText}
                        isUserLoggedIn={isUserLoggedIn}
                        hasVoted={hasVoted}
                        hasReason={hasReason}
                        onReasonAdded={() => setHasReason(true)}
                    />
                </div>
            )}
        </article>
    );
}
