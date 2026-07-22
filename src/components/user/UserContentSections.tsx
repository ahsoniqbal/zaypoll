import Link from "next/link";
import { Suspense } from "react";
import UserPolls from "./UserPolls";
import UserPollsSkeleton from "@/app/(main)/user/[username]/loading";

type Props = {
  userId: number;
  username: string;
  searchParams: { page?: string, tab?: string };
};
export default function UserContentSections({
  userId,
  username,
  searchParams,
}: Props) {

  return (
    <section>

      {/* Tabs */}
      <div className="mb-5 flex items-center border-b">
        <Link
          href={`/user/${username}`}
          aria-current="page"
          className="border-b-2 border-foreground px-1 pb-3 text-sm font-medium text-foreground"
        >
          Polls
        </Link>
      </div>

      {/* Content */}
      <div>
        <Suspense fallback={<UserPollsSkeleton />}>
          <UserPolls
            userId={userId}
            username={username}
            searchParams={searchParams}
          />
        </Suspense>

      </div>
    </section>
  );
}
