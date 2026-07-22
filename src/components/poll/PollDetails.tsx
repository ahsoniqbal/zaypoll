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
    <main className="mx-auto max-w-3xl space-y-3 px-1 py-4 sm:px-4 sm:py-6">
      <BackButton />

      {/*Poll Section */}
      <DetailPollView poll={poll} isUserLoggedIn={isUserLoggedIn} initialReasons={initialReasons} />
    </main>
  );
}
