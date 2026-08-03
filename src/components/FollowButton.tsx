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
    compact?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
};

export default function FollowButton({
    userId,
    initialIsFollowing,
    isLoggedIn,
    compact = false,
    onFollowChange,
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
                onFollowChange?.(res.isFollowing);
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
            variant={compact || isFollowing ? "outline" : "default"}
            size={compact ? "sm" : "default"}
            className={compact
                ? "h-7 min-w-0 bg-transparent px-2 text-xs text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary focus-visible:bg-primary focus-visible:text-primary-foreground"
                : "w-full min-w-24 sm:w-auto"}
        >
            {isPending && <LoaderCircle className="animate-spin" />}
            {isPending ? "Updating" : isFollowing ? "Following" : "Follow"}
        </Button>
    );
}
