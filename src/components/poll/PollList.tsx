
import { PollListingDto } from "@/dto/poll.dtos";
import FeedToggle from "./FeedToggle";
import PollFeed from "./PollFeed";
import Link from "next/link";

type Props = {
  polls: PollListingDto[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  isUserLoggedIn: boolean;
  feed: "for_you" | "following";
};

export default function PollList(props: Props) {
  const {
    polls,
    page,
    totalPages,
    hasNext,
    hasPrev,
    isUserLoggedIn,
    feed,
  } = props;

  return (
    <div className="space-y-4">
      {/* <CreatePollButton isLoggedIn={isUserLoggedIn} /> */}

      {/* <div>
        <FeedToggle currentFeed={feed} />
      </div> */}


      <div className="bg-white border rounded-xl p-4 transition hover:shadow-md cursor-pointer">
        <div className="flex items-center gap-3">
          <img src="https://github.com/shadcn.png" alt="User" className="w-10 h-10 rounded-full object-cover"/>
          <Link
            href="/polls/create"
            className="flex-1 text-left px-4 py-2.5 rounded-full border bg-gray-50 text-sm text-gray-500
                hover:bg-gray-100 hover:shadow-sm transition cursor-pointer">
            Start a new poll...
          </Link>
        </div>
      </div>



      <PollFeed
        polls={polls}
        page={page}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        isUserLoggedIn={isUserLoggedIn}
        basePath="/"
        query={{ feed }}
      />
    </div>
  );
}
