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
      <div className="space-y-4 mt-3">
        {res.data.length === 0 ? (
          <p className="text-gray-500 text-sm">No polls yet</p>
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