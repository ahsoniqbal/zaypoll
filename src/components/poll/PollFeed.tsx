import { PollListingDto } from "@/dto/poll.dtos";
import PollCard from "./PollCard";
import Pagination from "../Pagination";

type Props = {
  polls: PollListingDto[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  isUserLoggedIn: boolean;
  basePath: string;
  query?: Record<string, string>;
};

export default function PollFeed({
  polls,
  page,
  totalPages,
  isUserLoggedIn,
  basePath,
  query,
}: Props) {
  if (polls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm font-medium">No polls found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try another feed or explore a different topic.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {polls.map((poll) => (
        <PollCard
          key={poll.pollId}
          poll={poll}
          isUserLoggedIn={isUserLoggedIn}
        />
      ))}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={basePath}
        query={query}
      />
    </div>
  );
}
