"use client";

import { createPollAction } from "@/actions/poll.actions";
import toast from "react-hot-toast";
import { useTransition, useState, useMemo } from "react";
import { TopicDto } from "@/dto/category.dtos";
import { SquarePlus, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import TopicSelector from "../topic/TopicSelector";
import { AppButton } from "../AppButton";

export default function PollForm({ topics }: { topics: TopicDto[] }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const [options, setOptions] = useState<string[]>(["", ""]);

  // ✅ OPTIONS
  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // SUBMIT
  const handleSubmit = async (formData: FormData) => {

    options.forEach((opt, index) => {
      formData.append(`options[${index}]`, opt);
    });

    selectedTopics.forEach((id) => {
      formData.append("topicIds", String(id));
    });

    startTransition(async () => {
      const res = await createPollAction(formData);

      if (res.success && res.data) {
        toast.success("Poll created!");
        setTimeout(() => {
          router.push(`/polls/${res.data?.pollId}`);
        }, 500);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Create Poll</h1>
          <p className="text-sm text-gray-500">
            Ask a question and let others vote
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Ask your question..."
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm
            focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
          />

          {/* Description */}
          <textarea
            name="content"
            placeholder="Add more context (optional)"
            rows={3}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm
            focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none resize-none"
          />

          {/* OPTIONS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Options</p>

              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= 6}
                className="rounded-full px-3"
              >
                <SquarePlus className="w-4 h-4 mr-1" />
                Add
              </Button> */}

              <AppButton
                variant="outline"
                size="sm"
                icon={<SquarePlus />}
                onClick={addOption}
                disabled={options.length >= 6}
              >
                Add
              </AppButton>

            </div>

            {options.map((opt, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm
                  focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                />

                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Topics (FINAL VERSION) */}
          <TopicSelector
            topics={topics}
            selectedTopics={selectedTopics}
            onChange={setSelectedTopics}
            maxTopics={5}
          />

          {/* Submit */}
          <div className="flex justify-end pt-2">
            {/* <Button
              type="submit"
              disabled={isPending}
              className="rounded-full px-6"
            >
              {isPending ? "Publishing..." : "Create Poll"}
            </Button> */}

            <AppButton
              type="submit"
              isLoading={isPending}
              loadingText="Publishing..."
              className="px-6"
            >
              Create Poll
            </AppButton>

          </div>

        </form>
      </div>
    </div>
  );
}