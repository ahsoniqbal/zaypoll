"use client";

import { createPollAction } from "@/actions/poll.actions";
import toast from "react-hot-toast";
import { useTransition, useState } from "react";
import { TopicDto } from "@/dto/category.dtos";
import { SquarePlus, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import TopicSelector from "../topic/TopicSelector";
import { AppButton } from "../AppButton";
import {
  POLL_DESCRIPTION_MAX_LENGTH,
  POLL_DURATION_OPTIONS,
  POLL_MAX_OPTIONS,
  POLL_MAX_TOPICS,
  POLL_MIN_OPTIONS,
  POLL_MIN_TOPICS,
  POLL_OPTION_MAX_LENGTH,
  POLL_TITLE_MAX_LENGTH,
} from "@/types/constants";

export default function PollForm({ topics }: { topics: TopicDto[] }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ✅ OPTIONS
  const addOption = () => {
    if (options.length >= POLL_MAX_OPTIONS) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= POLL_MIN_OPTIONS) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // SUBMIT
  const handleSubmit = async (formData: FormData) => {
    const normalizedOptions = options.map((option) => option.trim());

    if (!title.trim()) {
      toast.error("Poll title is required");
      return;
    }

    if (normalizedOptions.some((option) => !option)) {
      toast.error("Please complete every option");
      return;
    }

    if (
      new Set(normalizedOptions.map((option) => option.toLocaleLowerCase())).size !==
      normalizedOptions.length
    ) {
      toast.error("Poll options must be unique");
      return;
    }

    if (selectedTopics.length < POLL_MIN_TOPICS) {
      toast.error("Select at least one topic");
      return;
    }

    if (selectedTopics.length > POLL_MAX_TOPICS) {
      toast.error(`You can select up to ${POLL_MAX_TOPICS} topics`);
      return;
    }

    normalizedOptions.forEach((opt, index) => {
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
      <div className="surface-card space-y-6 p-5 sm:p-6">

        <form action={handleSubmit} className="space-y-5">

          {/* Title */}
          <div className="space-y-2">
            <input
              id="poll-title"
              type="text"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title your poll"
              required
              maxLength={POLL_TITLE_MAX_LENGTH}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <textarea
              id="poll-description"
              name="content"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Body text (optional)"
              rows={4}
              maxLength={POLL_DESCRIPTION_MAX_LENGTH}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">

            {options.map((opt, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  maxLength={POLL_OPTION_MAX_LENGTH}
                  aria-label={`Option ${index + 1}`}
                  className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
                />

                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    aria-label={`Remove option ${index + 1}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-1">
              <AppButton
                variant="outline"
                size="sm"
                icon={<SquarePlus />}
                onClick={addOption}
                disabled={options.length >= POLL_MAX_OPTIONS}
              >
                Add option
              </AppButton>
            </div>
          </div>

          {/* Topics (FINAL VERSION) */}
          <TopicSelector
            topics={topics}
            selectedTopics={selectedTopics}
            onChange={setSelectedTopics}
            maxTopics={POLL_MAX_TOPICS}
          />

          <div className="space-y-2">
            <label htmlFor="poll-duration" className="text-sm font-medium">
              Poll duration
            </label>
            <select
              id="poll-duration"
              name="duration"
              defaultValue="never"
              className="w-full cursor-pointer rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            >
              {POLL_DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">

            <AppButton
              type="submit"
              isLoading={isPending}
              loadingText="Posting..."
              className="px-6"
            >
              Post
            </AppButton>

          </div>

        </form>
      </div>
    </div>
  );
}
