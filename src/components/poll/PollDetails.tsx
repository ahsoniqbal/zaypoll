import { CommentDto, PollDetailsDto } from "@/dto/poll.dtos"
import DetailPollView from "./DetailPollView";
import BackButton from "../BackButton";
import type { AnalyticsTab, PollAnalytics } from "@/types/poll-analytics.types";
import PollViewTracker from "./PollViewTracker";

type Props = {
    poll: PollDetailsDto;
    isUserLoggedIn: boolean;
    initialReasons: CommentDto[];
    analytics: PollAnalytics;
    initialTab: AnalyticsTab;
    canRefreshInsights: boolean;
};


export default function PollDetails({ poll, isUserLoggedIn, initialReasons, analytics, initialTab, canRefreshInsights }: Props) {
  return (
    <main className="mx-auto max-w-4xl space-y-3 px-1 py-4 sm:px-4 sm:py-6">
      <PollViewTracker pollId={poll.pollId} />
      {/* <BackButton /> */}

      {/*Poll Section */}
      <DetailPollView poll={poll} isUserLoggedIn={isUserLoggedIn} initialReasons={initialReasons} analytics={analytics} initialTab={initialTab} canRefreshInsights={canRefreshInsights} />
    </main>
  );
}
