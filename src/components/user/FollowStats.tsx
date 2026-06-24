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
            <div className="flex gap-4 mt-2 text-sm">
                <button
                    onClick={() => setModalType("followers")}
                    className="font-medium text-gray-800"
                >
                    {followersCount}
                    <span className="text-gray-500 ml-1">Followers</span>
                </button>

                <button
                    onClick={() => setModalType("following")}
                    className="font-medium text-gray-800"
                >
                    {followingCount}
                    <span className="text-gray-500 ml-1">Following</span>
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