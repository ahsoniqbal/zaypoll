"use client"

import { updateUserAction, } from "@/actions/user.actions"
import { useEffect, useState, useTransition } from "react";
import { User } from "@/types/user.types";
import { ActionResponse } from "@/types/common.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserUpdate({ user }: {user: User}) {

    const [actionResponse, setActionResponse] = useState<ActionResponse | null>(null)
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateUserAction(user.id, formData);
            setActionResponse(result);
        });
    }

    useEffect(() => {
        if (!actionResponse) return;

        const timeoutId = setTimeout(() => {
            setActionResponse(null);
        }, 3000)

        return () => clearTimeout(timeoutId)
    }, [actionResponse])


    return (
        <section className="w-full max-w-md rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h1 className="text-xl font-semibold mb-4">Update User</h1>

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

            <form action={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    defaultValue={user.userName}
                    name="username"
                    placeholder="Username"
                    required
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                />

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                >
                    {isPending ? "Updating..." : "Update"}
                </Button>
            </form>
        </section>

    )
}
