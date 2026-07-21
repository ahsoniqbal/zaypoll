import { PollListingDto } from "@/dto/poll.dtos";
import PollCard from "./PollCard";
import Pagination from "../Pagination";
import Link from "next/link";

type Props = {
  polls: PollListingDto[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  isUserLoggedIn: boolean;
  basePath: string;
  query?: Record<string, any>;
};

export default function PollFeed({
  polls,
  page,
  totalPages,
  hasNext,
  hasPrev,
  isUserLoggedIn,
  basePath,
  query,
}: Props) {
  if (polls.length === 0) {
    return <div className="text-center mt-10">No polls found</div>;
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