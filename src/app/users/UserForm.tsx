"use client"

import { createUserAction } from "@/actions/user.actions"
import { ActionResponse } from "@/types/common.types";
import { useEffect, useState, useTransition } from "react";

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
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-sm border">
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
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

                />

                <input
                    type="text"
                    name="password"
                    placeholder="Password"
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

                />

                <button
                    disabled={isPending}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isPending ? "Saving..." : "Save User"}
                </button>
            </form>
        </div>

    )
}