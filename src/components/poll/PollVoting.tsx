"use client"

import { PollOptionDto } from "@/dto/poll.dtos";

type Props = {
    options: PollOptionDto[];
    selectedOption: number | null;
    onSelect: (id: number) => void;

}

export default function PollVoting({ options, selectedOption, onSelect }: Props) {

    return (

        <div className="space-y-2">
            {options.map((opt) => {
                const isSelected = selectedOption === opt.id;

                return (
                    <label
                        key={opt.id}
                        className={`
          flex items-center h-12 px-4 gap-3 rounded-lg border transition-all cursor-pointer
          ${isSelected
                                ? "bg-gray-100 border-black"
                                : "bg-white hover:bg-gray-50 border-gray-200"}
        `}
                    >
                        <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => onSelect(opt.id)}
                            className="h-5 w-5 accent-black cursor-pointer
          transition-transform duration-150
          checked:scale-110 "
                        />

                        <span className="text-sm text-gray-800">
                            {opt.optionText}
                        </span>
                    </label>
                );
            })}
            
<p className="text-xs text-gray-500 mb-1">
    Select an option to vote
  </p>

        </div>


    );
}