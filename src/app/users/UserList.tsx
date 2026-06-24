"use client"

import { deleteUserAction } from "@/actions/user.actions"
import Link from "next/link";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { User } from "@/types/user.types";
import { useRouter } from "next/navigation";

type Post = {
    id: number;
    title: string;
    likes: number;
    likedByMe: boolean;
}

export default function UserList({ users }: { users: User[] }) {
    const router = useRouter();
    const [actionResponse, setActionResponse] = useState<{ success: boolean; message: string; } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [optimisticUsers, setOptimisticUsers] =
        useOptimistic(users, (currentUsers, id) => currentUsers.filter((u: User) => u.id !== id))

    async function handleDelete(id: number) {
        startTransition(async () => {
            setOptimisticUsers(id);
            const res = await deleteUserAction(id);
            setActionResponse(res);

            if (!res.success) {
                router.refresh();
            }
        })
    }

    useEffect(() => {
        if (!actionResponse) return;

        const timeoutId = setTimeout(() => {
            setActionResponse(null);
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [actionResponse]);

    return (


        <div className="w-full bg-white p-6 rounded-xl shadow-sm border">
            <h1 className="text-xl font-semibold mb-4">Users</h1>

            {actionResponse && (
                <p
                    className={`mb-4 text-sm font-medium ${actionResponse.success
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                >
                    {actionResponse.message}
                </p>
            )}

            <div className="space-y-3">
                {optimisticUsers.map((u: User) => (
                    <div
                        key={u.id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                        <div className="text-sm">
                            <Link href={`/users/${u.id}`}><p className="font-medium">{u.userName}</p></Link>
                            <p className="text-gray-500 text-xs">
                                {new Date(u.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <button
                            disabled={isPending}
                            onClick={() => handleDelete(u.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                ))}
            </div>
        </div>

    )
}