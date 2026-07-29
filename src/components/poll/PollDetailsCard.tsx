"use client";

import { CommentDto, PollListingDto } from "@/dto/poll.dtos";
import PollHeader from "./PollHeader";
import PollOptions from "./PollOptions";
import PollReactions from "./PollReactions";
import { useVote } from "@/hooks/useVote";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PollCommentButton from "./PollCommentButton";
import { AppButton } from "../AppButton";
import { useAuthModal } from "@/hooks/useAuthModal";
import type { AnalyticsTab, PollAnalytics } from "@/types/poll-analytics.types";
import PollDetailTabs from "./PollDetailTabs";
import { usePollExpiry } from "@/hooks/usePollExpiry";
import PollExpiryStatus from "./PollExpiryStatus";
import { formatCompactNumber } from "@/lib/utils";

type Props = {
    poll: PollListingDto;
    isUserLoggedIn: boolean;
    isDetailView?: boolean;
    initialReasons: CommentDto[];
    analytics?: PollAnalytics;
    initialTab?: AnalyticsTab;
    canRefreshInsights?: boolean;
};

export default function PollDetailsCard({ poll, isUserLoggedIn, isDetailView, initialReasons, analytics, initialTab = "reasons", canRefreshInsights = false }: Props) {
    const { handleVote, isPending } = useVote(poll.pollId);
    const { open } = useAuthModal();

    const [selectedOption, setSelectedOption] = useState<number | null>(null); //option id before showing results

    const [hasVoted, setHasVoted] = useState(poll.hasVoted);
    const [userVoteOptionId, setUserVoteOptionId] = useState<number | null>(poll.userVoteOptionId); //option id after showing results
    const [options, setOptions] = useState(poll.options);
    const [totalVotes, setTotalVotes] = useState(poll.totalVotes);

    const router = useRouter();
    const [hasReason, setHasReason] = useState(poll.hasReason);
    const [serverExpired, setServerExpired] = useState(false);
    const hasReachedExpiry = usePollExpiry(poll.expiresAt, poll.isExpired);
    const isExpired = serverExpired || hasReachedExpiry;

    const onClickVoteButton = async () => {
        if (!selectedOption || isPending || hasVoted || isExpired) {
            return;
        }

        if (!isUserLoggedIn) {
            open();
            return;
        }

        const result = await handleVote(selectedOption, true);

        if (result.success) {
            setHasVoted(true);
            setUserVoteOptionId(selectedOption);
            setOptions((previous) =>
                previous.map((option) =>
                    option.id === selectedOption
                        ? { ...option, voteCount: option.voteCount + 1 }
                        : option
                )
            );
            setTotalVotes((previous) => previous + 1);
            setSelectedOption(null);
        } else if (result.message.toLowerCase().includes("poll has ended")) {
            setServerExpired(true);
        }
    }

    return (
        <article className={`surface-card p-3 sm:p-3 ${!isDetailView ? "cursor-pointer transition-all hover:-translate-y-px hover:ring-primary/20 hover:shadow-md" : ""}`}
            onClick={(e) => {
                if (isDetailView) return;
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
            <div className="mt-3 mb-4">
                {poll.title && (
                    <h1 className="mb-1 text-lg font-semibold leading-snug text-foreground">{poll.title}</h1>
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
                        <span aria-hidden="true">
                            &middot;
                        </span>
                        <PollExpiryStatus expiresAt={poll.expiresAt} isExpired={isExpired} />
                    </>
                )}
            </div>

            {/* Likes + comments + vote button */}
            <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                    <PollReactions
                        pollId={poll.pollId}
                        upvotes={poll.upvotes}
                        downvotes={poll.downvotes}
                        userVote={poll.userReaction}
                        isUserLoggedIn={isUserLoggedIn}
                    />
                    <PollCommentButton pollId={poll.pollId} reasonCount={poll.reasonCount} isDisabled={isDetailView} />

                </div>

                <div onClick={(e) => e.stopPropagation()} >
                    {/* <Button type="button" size="sm" className="rounded-full disabled:opacity-50 hover:shadow-sm active:scale-[0.98] transition-transform disabled:cursor-not-allowed"
                        disabled={!selectedOption || isPending || hasVoted || isExpired}
                        role={!isDetailView ? "button" : undefined}
                        tabIndex={!isDetailView ? 0 : undefined}
                        onClick={onClickVoteButton}
                    >
                        {isPending ? "Voting..." : "Vote"}
                    </Button> */}


                    <AppButton
                        // variant="ghost"
                        // size="sm"
                        onClick={onClickVoteButton}
                        disabled={!selectedOption || isPending || hasVoted || isExpired}
                        isLoading={isPending}
                        loadingText="Voting..."
                    >
                        {isExpired ? "Poll ended" : "Vote"}
                    </AppButton>
                </div>

            </div>
            {isDetailView && analytics &&
                <PollDetailTabs
                        initialTab={initialTab}
                        analytics={analytics}
                        canRefreshInsights={canRefreshInsights}
                        pollId={poll.pollId}
                        options={poll.options}
                        isUserLoggedIn={isUserLoggedIn}
                        hasVoted={hasVoted}
                        userVoteOptionId={userVoteOptionId}
                        hasReason={hasReason}
                        onReasonAdded={() => {
                            setHasReason(true);
                            router.refresh();
                        }}
                        initialReasons={initialReasons}
                    />
            }
        </article>
    );
}
