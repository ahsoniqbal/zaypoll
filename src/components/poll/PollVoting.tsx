"use client"

import { PollOptionDto } from "@/dto/poll.dtos";

type Props = {
    options: PollOptionDto[];
    selectedOption: number | null;
    onSelect: (id: number) => void;

}

export default function PollVoting({ options, selectedOption, onSelect }: Props) {

    return (

        <fieldset className="space-y-2">
            <legend className="sr-only">Choose an option</legend>
            {options.map((opt) => {
                const isSelected = selectedOption === opt.id;

                return (
                    <label
                        key={opt.id}
                        className={`
          flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors
          ${isSelected
                                ? "border bg-accent"
                                : "bg-background hover:bg-muted/60"}
        `}
                    >
                        <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => onSelect(opt.id)}
                            name="poll-option"
                            className="h-4 w-4 cursor-pointer accent-black"
                        />

                        <span className="text-sm font-medium text-foreground">
                            {opt.optionText}
                        </span>
                    </label>
                );
            })}
            
{/* <p className="mb-1 text-xs text-muted-foreground">
    Select an option to vote
  </p> */}

        </fieldset>


    );
}
