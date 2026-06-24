"use client";

import { CommentDto, PollListingDto } from "@/dto/poll.dtos";
import PollHeader from "./PollHeader";
import PollOptions from "./PollOptions";
import PollReactions from "./PollReactions";
import Link from "next/link";
import { useVote } from "@/hooks/useVote";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import PollCommentButton from "./PollCommentButton";
import ReasonSection from "./ReasonSection";
import { AppButton } from "../AppButton";

type Props = {
    poll: PollListingDto;
    isUserLoggedIn: boolean;
    isDetailView?: boolean;
    initialReasons: CommentDto[];
};

export default function PollDetailsCard({ poll, isUserLoggedIn, isDetailView, initialReasons }: Props) {
    const { handleVote, isPending } = useVote(poll.pollId);

    const [selectedOption, setSelectedOption] = useState<number | null>(null); //option id before showing results

    const [hasVoted, setHasVoted] = useState(poll.hasVoted);
    const [userVoteOptionId, setUserVoteOptionId] = useState<number | null>(poll.userVoteOptionId); //option id after showing results

    const [reason, setReason] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (selectedOption) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [selectedOption]);

    const onClickVoteButton = async () => {
        if (!selectedOption || isPending || hasVoted) {
            return;
        }

        const success = await handleVote(selectedOption, reason, true);

        if (success) {
            setHasVoted(true);
            setUserVoteOptionId(selectedOption);
            setSelectedOption(null);
            setReason("");
        }
    }

    return (
        <div className={`bg-white border rounded-xl p-4 transition ${!isDetailView ? "hover:shadow-md cursor-pointer" : ""}`}
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
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{poll.title}</h3>
                )}
                <p className="text-sm text-gray-600 leading-6">{poll.content}</p>
            </div>

            <PollOptions
                options={poll.options}
                hasVoted={hasVoted}
                userVoteOptionId={userVoteOptionId}
                totalVotes={poll.totalVotes}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
            />

            <div className={`overflow-hidden transition-all duration-300 ease-out
                    ${selectedOption && !hasVoted ? "max-h-[100px] mt-3 opacity-100" : "max-h-0 opacity-0"}
                    `}>
                <Input
                    ref={inputRef}
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why did you choose this?"
                    maxLength={100}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50
                            focus:bg-white focus:border-black focus-visible:ring-2 focus-visible:ring-black/10"/>
            </div>

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
            {isDetailView &&
                <div className="mt-5">
                    <hr className="my-4 border-gray-200" />
                    <ReasonSection
                        pollId={poll.pollId}
                        options={poll.options}
                        isUserLoggedIn={isUserLoggedIn}
                        hasVoted={hasVoted}
                        userVoteOptionId={userVoteOptionId}
                        hasReason={poll.hasReason}
                        initialReasons={initialReasons}
                    />
                </div>
            }
        </div>
    );
}