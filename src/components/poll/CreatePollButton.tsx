"use client";

import { useRouter } from "next/navigation";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Plus } from "lucide-react";

type Props = {
  isLoggedIn: boolean;
};

export default function CreatePollButton({ isLoggedIn }: Props) {
  const router = useRouter();
  const { open } = useAuthModal();

  const handleClick = () => {
    if (!isLoggedIn) {
      open(); // ✅ show login modal
      return;
    }

    router.push("/polls/create"); //navigate normally
  };

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left text-sm text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/60"
      onClick={handleClick}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></span>
      <span className="flex-1">Start a new poll…</span>
    </button>
  );
}
