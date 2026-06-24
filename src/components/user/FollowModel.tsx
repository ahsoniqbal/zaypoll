"use client";

import { useEffect, useState } from "react";
import {
    getFollowersAction,
    getFollowingAction,
} from "@/actions/user.actions";

type User = {
    id: number;
    name: string;
    user_name: string;
    image: string | null;
};

type Props = {
    userId: number;
    type: "followers" | "following";
    isOpen: boolean;
    onClose: () => void;
};

export default function FollowModal({
    userId,
    type,
    isOpen,
    onClose,
}: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    //Fetch when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                const data = type === "followers"
                        ? await getFollowersAction(userId)
                        : await getFollowingAction(userId);

                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, type, userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-lg">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg capitalize">{type}</h2>
                    <button onClick={onClose}>✖</button>
                </div>

                {/* Content */}
                {loading ? (
                    <p>Loading...</p>
                ) : users.length === 0 ? (
                    <p>No {type}</p>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {users.map((u) => (
                            <div key={u.id} className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {u.image ? (
                                        <img src={u.image} className="w-full h-full object-cover" />
                                    ) : null}
                                </div>

                                <div>
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-sm text-gray-500">@{u.user_name}</p>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
