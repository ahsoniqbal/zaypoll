"use client"

import { PollOptionDto } from "@/dto/poll.dtos";
import PollResults from "./PollResults";
import PollVoting from "./PollVoting";

type Props = {
    options: PollOptionDto[];
    hasVoted: boolean;
    userVoteOptionId: number | null;
    totalVotes: number;
    selectedOption: number | null;
    onSelect: (id: number) => void;
    isExpired?: boolean;
}
export default function PollOptions({ options, hasVoted, userVoteOptionId, totalVotes, selectedOption, onSelect, isExpired = false }: Props) {

    return (

        <div
            className="mt-3 space-y-3"
            onClick={hasVoted || isExpired ? undefined : (event) => event.stopPropagation()}
        >
            {hasVoted || isExpired ? (
                <PollResults
                    options={options}
                    totalVotes={totalVotes}
                    userVoteOptionId={userVoteOptionId}
                />
            ) : (
                <PollVoting options={options} selectedOption={selectedOption} onSelect={onSelect} />
            )}
            
        </div>

    )
}
