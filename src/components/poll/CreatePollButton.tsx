"use client";

import { useRouter } from "next/navigation";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="outline"
      className="mb-5 rounded-full px-5 py-2.5 text-sm font-semibold"
      onClick={handleClick}
    >
      + Create Poll
    </Button>
  );
}
