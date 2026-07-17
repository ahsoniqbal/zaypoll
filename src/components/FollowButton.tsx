"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/actions/user.actions";
import { useAuthModal } from "@/hooks/useAuthModal";

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
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-4 py-2 rounded text-white ${isFollowing ? "bg-gray-500" : "bg-blue-600"
                }`}
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </button>
    );
}
