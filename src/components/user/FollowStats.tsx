"use client";

import { useState } from "react";
import FollowModal from "./FollowModel";

type Props = {
    userId: number;
    followersCount: number;
    followingCount: number;
};

export default function FollowStats({
    userId,
    followersCount,
    followingCount,
}: Props) {
    const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

    return (
        <>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <button
                    type="button"
                    onClick={() => setModalType("followers")}
                    className="rounded-sm font-semibold tabular-nums text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {followersCount}
                    <span className="ml-1 font-normal text-muted-foreground">Followers</span>
                </button>

                <button
                    type="button"
                    onClick={() => setModalType("following")}
                    className="rounded-sm font-semibold tabular-nums text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {followingCount}
                    <span className="ml-1 font-normal text-muted-foreground">Following</span>
                </button>
            </div>

            <FollowModal
                userId={userId}
                type={modalType || "followers"}
                isOpen={modalType !== null}
                onClose={() => setModalType(null)}
            />
        </>
    );
}
