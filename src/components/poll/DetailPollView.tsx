import { CommentDto, PollDetailsDto } from "@/dto/poll.dtos";
import PollDetailsCard from "./PollDetailsCard";
import type { AnalyticsTab, PollAnalytics } from "@/types/poll-analytics.types";

type Props = {
  poll: PollDetailsDto;
  isUserLoggedIn: boolean;
  initialReasons: CommentDto[];
  analytics: PollAnalytics;
  initialTab: AnalyticsTab;
  canRefreshInsights: boolean;
   
};

export default function DetailPollView({ poll, isUserLoggedIn, initialReasons, analytics, initialTab, canRefreshInsights }: Props) {
  return (
    <div className="space-y-5">

      {/* Poll */}
      <div>
        <PollDetailsCard poll={poll} isUserLoggedIn={isUserLoggedIn} isDetailView={true} initialReasons={initialReasons} analytics={analytics} initialTab={initialTab} canRefreshInsights={canRefreshInsights}/>
      </div>
      

    </div>
  );
}
