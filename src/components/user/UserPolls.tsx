import { auth } from "@/auth";
import { getUserPolls } from "@/services/user.services";
import PollCard from "../poll/PollCard";
import Pagination from "../Pagination";
import { DEFAULT_PAGE } from "@/types/constants";

type Props = {
  userId: number;
  username: string;
  searchParams: { page?: string };
};

export default async function UserPolls({
  userId,
  username,
  searchParams,
}: Props) {
  const session = await auth();
  const loggedInUserId = session?.user?.id ?? null;

  const page = Number(searchParams?.page || DEFAULT_PAGE);

  const res = await getUserPolls(userId, loggedInUserId, page);

  return (
    <>
      {/* Poll List */}
      <div className="space-y-4">
        {res.data.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-14 text-center">
            <p className="text-sm font-medium text-foreground">No polls yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Polls created by this user will appear here.
            </p>
          </div>
        ) : (
          res.data.map((poll) => (
            <PollCard
              key={poll.pollId}
              poll={poll}
              isUserLoggedIn={!!loggedInUserId}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {res.totalPages > 1 && (
        <Pagination
          page={res.page}
          totalPages={res.totalPages}
          basePath={`/user/${username}`}
          //  query={{ tab: "comments" }} // In future i can add commetns section and then i can use this query to maintain the active tab state in pagination
        />
      )}
    </>
  );
}
