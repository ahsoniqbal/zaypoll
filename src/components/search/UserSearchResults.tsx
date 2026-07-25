import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserSearchResult } from "@/services/search-user.service";
import { getInitials } from "@/lib/utils";

export default function UserSearchResults({
  users,
}: {
  users: UserSearchResult[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {users.map((user, index) => (
        <Link
          key={user.id}
          href={`/user/${encodeURIComponent(user.userName)}`}
          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/70 focus-visible:bg-muted focus-visible:outline-none ${
            index > 0 ? "border-t" : ""
          }`}
        >
          <Avatar className="size-10">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{getInitials(user.name, user.userName)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-sm text-muted-foreground">
              @{user.userName}
            </span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {user.followersCount.toLocaleString()}{" "}
            {user.followersCount === 1 ? "follower" : "followers"}
          </span>
        </Link>
      ))}
    </div>
  );
}
