"use client"

import { createUserAction } from "@/actions/user.actions"
import { ActionResponse } from "@/types/common.types";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserForm() {

    const [isPending, startTransition] = useTransition();
    const [actionResponse, setActionResponse] = useState<ActionResponse | null>();
    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const res = await createUserAction(formData);
            setActionResponse(res);
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
        <section className="w-full max-w-md rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h1 className="text-xl font-semibold mb-4">Create User</h1>

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
                    {isPending ? "Saving..." : "Save User"}
                </Button>
            </form>
        </section>

    )
}
