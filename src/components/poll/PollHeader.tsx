"use client"

import { timeAgo } from "@/utils/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";

type Props = {
    username: string;
    name: string;
    image: string;
    createdAt: Date | string;
};

export default function PollHeader({ username, name, image, createdAt }: Props) {
    return (
        <div className="flex gap-3 items-center mb-3">

            <Link href={`/user/${username}`}>
                <Avatar className="cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
                    <AvatarFallback>  <span>{name.slice(0, 2).toUpperCase()}</span></AvatarFallback>
                </Avatar>
            </Link>
            <div className="leading-5">
                <Link href={`/user/${username}`}> <span className="font-semibold text-gray-700 hover:underline">{name}</span></Link>
                <p className="text-gray-600 text-xs">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}