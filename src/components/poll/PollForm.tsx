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
  POLL_MAX_OPTIONS,
  POLL_MAX_TOPICS,
  POLL_MIN_OPTIONS,
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
      <div className="space-y-6 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Create poll</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask a question and let others vote
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="poll-title" className="text-sm font-medium">
                Question <span className="text-destructive">*</span>
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {title.length}/{POLL_TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="poll-title"
              type="text"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What would you like to ask?"
              required
              maxLength={POLL_TITLE_MAX_LENGTH}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="poll-description" className="text-sm font-medium">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {description.length}/{POLL_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="poll-description"
              name="content"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context to help people make an informed choice"
              rows={4}
              maxLength={POLL_DESCRIPTION_MAX_LENGTH}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Options <span className="text-destructive">*</span></p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {POLL_MIN_OPTIONS}–{POLL_MAX_OPTIONS} unique choices, up to {POLL_OPTION_MAX_LENGTH} characters each
                </p>
              </div>

              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= POLL_MAX_OPTIONS}
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
          </div>

          {/* Topics (FINAL VERSION) */}
          <TopicSelector
            topics={topics}
            selectedTopics={selectedTopics}
            onChange={setSelectedTopics}
            maxTopics={POLL_MAX_TOPICS}
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
