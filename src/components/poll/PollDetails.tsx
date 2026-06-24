import { CommentDto, PollDetailsDto } from "@/dto/poll.dtos"
import DetailPollView from "./DetailPollView";
import BackButton from "../BackButton";

type Props = {
    poll: PollDetailsDto;
    isUserLoggedIn: boolean;
    initialReasons: CommentDto[];
};


export default function PollDetails({ poll, isUserLoggedIn, initialReasons }: Props) {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2">
      <BackButton />

      {/*Poll Section */}
      <DetailPollView poll={poll} isUserLoggedIn={isUserLoggedIn} initialReasons={initialReasons} />
    </div>
  );
}
