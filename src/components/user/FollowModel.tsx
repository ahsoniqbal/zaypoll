"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
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

    useEffect(() => {
        if (!isOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="follow-dialog-title"
                className="w-full max-w-md rounded-t-2xl bg-card shadow-xl ring-1 ring-foreground/10 sm:rounded-2xl"
            >

                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 id="follow-dialog-title" className="text-base font-semibold capitalize">{type}</h2>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-3">
                  {loading ? (
                    <div role="status" className="space-y-2 p-2">
                      <span className="sr-only">Loading {type}…</span>
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex animate-pulse items-center gap-3 py-2 motion-reduce:animate-none">
                          <div className="h-10 w-10 rounded-full bg-muted" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-muted" />
                            <div className="h-3 w-20 rounded bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <p className="px-3 py-12 text-center text-sm text-muted-foreground">No {type} yet</p>
                  ) : (
                    <div className="space-y-1">
                        {users.map((u) => (
                            <Link
                              key={u.id}
                              href={`/user/${encodeURIComponent(u.user_name)}`}
                              onClick={onClose}
                              className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
                            >

                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                    {u.image ? (
                                        <Image src={u.image} alt="" fill sizes="40px" className="object-cover" />
                                    ) : (
                                      <span className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                                        {(u.name || u.user_name).charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{u.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">@{u.user_name}</p>
                                </div>

                            </Link>
                        ))}
                    </div>
                  )}
                </div>
            </div>
        </div>
    );
}
