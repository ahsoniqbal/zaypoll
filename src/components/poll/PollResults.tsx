"use client";

import { PollOptionDto } from "@/dto/poll.dtos";
import { useEffect, useState } from "react";
import clsx from "clsx";

type Props = {
    options: PollOptionDto[];
    totalVotes: number;
    userVoteOptionId: number | null;
};

export default function PollResults({
    options,
    totalVotes,
    userVoteOptionId,
}: Props) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="space-y-3">
            {options.map((opt) => {
                const percentage =
                    totalVotes > 0
                        ? Math.round((opt.voteCount / totalVotes) * 100)
                        : 0;

                const isSelected = opt.id === userVoteOptionId;

                return (
                    <div key={opt.id} className="group relative w-full overflow-hidden rounded-lg border bg-background p-3">
                        {/* Progress */}
                        <div className={clsx(
                                "absolute left-0 inset-y-0 transition-all duration-700 ease-out",
                                isSelected ? "bg-primary/20" : "bg-muted"
                            )}
                            style={{ width: animate ? `${percentage}%` : "0%" }}
                        />

                        {/* Content */}
                        <div className="relative flex justify-between items-center font-medium text-sm">
                            <span className="flex items-center gap-2"
                            // className={clsx(
                            //     isSelected ? "text-white font-semibold" : "text-gray-800"
                            // )}
                            >
                                {isSelected ? (
                                    <span className="w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    </span>
                                ) : (<span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></span>)}
                                {opt.optionText}
                            </span>

                            <span
                                className={clsx(
                                    //    isSelected ? "text-white font-semibold" : "text-gray-700"
                                    isSelected ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {percentage}%
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Total */}
            <div className="text-xs tabular-nums text-muted-foreground">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </div>
        </div>
    );
}
