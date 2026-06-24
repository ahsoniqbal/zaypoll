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
}
export default function PollOptions({ options, hasVoted, userVoteOptionId, totalVotes, selectedOption, onSelect }: Props) {

    return (

        <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
            {hasVoted ? (
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