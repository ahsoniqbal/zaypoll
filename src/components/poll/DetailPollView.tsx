import { CommentDto, PollDetailsDto } from "@/dto/poll.dtos";
import PollDetailsCard from "./PollDetailsCard";

type Props = {
  poll: PollDetailsDto;
  isUserLoggedIn: boolean;
  initialReasons: CommentDto[];
   
};

export default function DetailPollView({ poll, isUserLoggedIn, initialReasons }: Props) {
  return (
    <div className="space-y-5">

      {/* Poll */}
      <div>
        <PollDetailsCard poll={poll} isUserLoggedIn={isUserLoggedIn} isDetailView={true} initialReasons={initialReasons}/>
      </div>
      

    </div>
  );
}