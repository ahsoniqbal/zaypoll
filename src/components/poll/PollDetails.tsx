import { CommentDto, PollDetailsDto } from "@/dto/poll.dtos"
import DetailPollView from "./DetailPollView";
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
    <main className="content-shell space-y-3">
      <PollViewTracker pollId={poll.pollId} />
      {/* <BackButton /> */}

      {/*Poll Section */}
      <DetailPollView poll={poll} isUserLoggedIn={isUserLoggedIn} initialReasons={initialReasons} analytics={analytics} initialTab={initialTab} canRefreshInsights={canRefreshInsights} />
    </main>
  );
}
