"use client"

import { deleteUserAction } from "@/actions/user.actions"
import Link from "next/link";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { User } from "@/types/user.types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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


        <section className="w-full rounded-xl bg-card p-6 ring-1 ring-foreground/10">
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
                            <p className="text-xs text-muted-foreground">
                                {new Date(u.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleDelete(u.id)}
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                ))}
            </div>
        </section>

    )
}
