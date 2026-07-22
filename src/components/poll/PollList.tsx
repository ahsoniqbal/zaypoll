
import { PollListingDto } from "@/dto/poll.dtos";
import PollFeed from "./PollFeed";
import CreatePollButton from "./CreatePollButton";

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


      <CreatePollButton isLoggedIn={isUserLoggedIn} />



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
