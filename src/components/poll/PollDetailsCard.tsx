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

    const router = useRouter();
    const [hasReason, setHasReason] = useState(poll.hasReason);

    const onClickVoteButton = async () => {
        if (!selectedOption || isPending || hasVoted) {
            return;
        }

        if (!isUserLoggedIn) {
            open();
            return;
        }

        const success = await handleVote(selectedOption, true);

        if (success) {
            setHasVoted(true);
            setUserVoteOptionId(selectedOption);
            setSelectedOption(null);
        }
    }

    return (
        <article className={`rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 ${!isDetailView ? "cursor-pointer transition-colors hover:bg-card/80" : ""}`}
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
                options={poll.options}
                hasVoted={hasVoted}
                userVoteOptionId={userVoteOptionId}
                totalVotes={poll.totalVotes}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
            />

            {/* Likes + comments + vote button */}
            <div className="flex items-center justify-between mt-4 pt-3">
                <div className="flex items-center gap-1">
                    <PollReactions
                        pollId={poll.pollId}
                        upvotes={poll.upvotes}
                        downvotes={poll.downvotes}
                        userVote={poll.userReaction}
                        isUserLoggedIn={isUserLoggedIn}
                    />
                    <PollCommentButton pollId={poll.pollId} isDisabled={isDetailView} />

                </div>

                <div onClick={(e) => e.stopPropagation()} >
                    {/* <Button type="button" size="sm" className="rounded-full disabled:opacity-50 hover:shadow-sm active:scale-[0.98] transition-transform disabled:cursor-not-allowed"
                        disabled={!selectedOption || isPending || hasVoted}
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
                        disabled={!selectedOption || isPending || hasVoted}
                        isLoading={isPending}
                        loadingText="Voting..."
                    >
                        Vote
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
