import { Suspense } from "react";
import UserPolls from "./UserPolls";
import UserPollsSkeleton from "@/app/(main)/user/[username]/loading";

type Props = {
  userId: number;
  loggedInUserId: number | null;
  username: string;
  searchParams: { page?: string, tab?: string };
};
export default function UserContentSections({
  userId,
  loggedInUserId,
  username,
  searchParams,
}: Props) {

  const currentTab = searchParams?.tab ?? "polls";

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="bg-white border rounded-2xl shadow-sm p-4">

        <div className="flex gap-2 text-sm font-medium bg-gray-100 p-1 rounded-xl w-fit">

          <a
            href={`/user/${username}?tab=polls`}
            className={`px-4 py-1.5 rounded-lg transition
              ${currentTab === "polls"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-800"}`}
          >
            Polls
          </a>

          <a
            href={`/user/${username}?tab=comments`}
            className={`px-4 py-1.5 rounded-lg transition
              ${currentTab === "comments"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-800"}`}
          >
            Comments
          </a>

        </div>
      </div>

      {/* Content */}
      <div className="bg-white border rounded-2xl shadow-sm p-4">


        <Suspense fallback={<UserPollsSkeleton />}>
          <UserPolls
            userId={userId}
            username={username}
            searchParams={searchParams}
          />
        </Suspense>

      </div>

    </div>
  );
}