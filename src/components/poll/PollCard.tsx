"use client";

import { PollListingDto } from "@/dto/poll.dtos";
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
import { AppButton } from "../AppButton";


type Props = {
    poll: PollListingDto;
    isUserLoggedIn: boolean;
};

export default function PollCard({ poll, isUserLoggedIn }: Props) {
    const { handleVote, isPending } = useVote(poll.pollId);

    const [selectedOption, setSelectedOption] = useState<number | null>(null); //option id before showing results
    const [reason, setReason] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [options, setOptions] = useState(poll.options);
    const [totalVotes, setTotalVotes] = useState(poll.totalVotes);
    const [hasVoted, setHasVoted] = useState(poll.hasVoted);
    const [userVoteOptionId, setUserVoteOptionId] = useState(poll.userVoteOptionId);


    useEffect(() => {
        if (selectedOption) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [selectedOption]);

    const onClickVoteButton = async () => {
        if (!selectedOption || isPending || hasVoted) return;


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
        setReason("")



        try {
            const success = await handleVote(selectedOption, reason);

            // ROLLBACK if failed
            if (!success) {
                setOptions(prevOptions);
                setTotalVotes(prevTotalVotes);
                setHasVoted(prevHasVoted);
                setUserVoteOptionId(prevUserVoteOptionId);
            }

        } catch {
            // ROLLBACK if error
            setOptions(prevOptions);
            setTotalVotes(prevTotalVotes);
            setHasVoted(prevHasVoted);
            setUserVoteOptionId(prevUserVoteOptionId);
        }

    }

    return (
        <div className={`bg-white border rounded-xl p-4 transition hover:shadow-md cursor-pointer`}
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

            <div className="mt-3 mb-4">
                {poll.title && (
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{poll.title}</h3>
                )}
                <p className="text-sm text-gray-600 leading-6">{poll.content}</p>
            </div>

            <PollOptions
                options={options}
                hasVoted={hasVoted}
                userVoteOptionId={userVoteOptionId}
                totalVotes={totalVotes}
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
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex items-center gap-1">
                    <PollReactions
                        pollId={poll.pollId}
                        upvotes={poll.upvotes}
                        downvotes={poll.downvotes}
                        userVote={poll.userReaction}
                        isUserLoggedIn={isUserLoggedIn}
                    />
                    <PollCommentButton pollId={poll.pollId} isDisabled={false} />

                </div>

                <div onClick={(e) => e.stopPropagation()} >
                    {/* <Button type="button" size="sm" className="rounded-full disabled:opacity-50 hover:shadow-sm active:scale-[0.98] transition-transform disabled:cursor-not-allowed"
                        disabled={!selectedOption || isPending || hasVoted}
                        onClick={onClickVoteButton}
                    >
                        {isPending ? "Voting..." : "Vote"}
                    </Button> */}

                    <AppButton
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

        </div>
    );
}