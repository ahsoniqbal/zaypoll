"use client"

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";

type Props = {
    username: string;
    name: string;
    image: string | null;
    createdAt: Date | string;
};

export default function PollHeader({ username, name, image, createdAt }: Props) {
    return (
        <div className="mb-3 flex items-center gap-3">

            <Link href={`/user/${username}`}>
                <Avatar>
                    {image && <AvatarImage src={image} alt={`${name}'s profile`} />}
                    <AvatarFallback>  <span>{name.slice(0, 2).toUpperCase()}</span></AvatarFallback>
                </Avatar>
            </Link>
            <div className="min-w-0 leading-5">
                <Link href={`/user/${username}`} className="block truncate text-sm font-medium text-foreground hover:underline">{name}</Link>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
