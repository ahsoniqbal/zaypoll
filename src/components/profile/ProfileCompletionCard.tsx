"use client";

import { ArrowRight, UserRoundCheck } from "lucide-react";
import { useProfileCompletionDialog } from "./ProfileCompletionProvider";

export default function ProfileCompletionCard() {
  const dialog = useProfileCompletionDialog();
  if (!dialog || dialog.isComplete) return null;

  return (
    <button
      type="button"
      onClick={() => dialog.openDialog("edit")}
      className="group w-full rounded-xl border border-primary/20 bg-primary/5 p-3 text-left transition hover:border-primary/35 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <UserRoundCheck className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Complete your profile</span>
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
            Get more relevant polls and insights.
          </span>
        </span>
        <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
