"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/actions/user.actions";
import { useAuthModal } from "@/hooks/useAuthModal";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    userId: number;
    initialIsFollowing: boolean;
    isLoggedIn: boolean;
};

export default function FollowButton({
    userId,
    initialIsFollowing,
    isLoggedIn,
}: Props) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();
    const { open } = useAuthModal();

    const handleToggle = () => {
        if (!isLoggedIn) {
            open();
            return;
        }

        startTransition(async () => {
            const res = await toggleFollowAction(userId);

            if (res.success && typeof res.isFollowing === "boolean") {
                setIsFollowing(res.isFollowing); //sync with server truth
            } else {
                console.error(res.message);
            }
        });
    };

    return (
        <Button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={isFollowing}
            variant={isFollowing ? "outline" : "default"}
            className="w-full min-w-24 sm:w-auto"
        >
            {isPending && <LoaderCircle className="animate-spin" />}
            {isPending ? "Updating" : isFollowing ? "Following" : "Follow"}
        </Button>
    );
}
