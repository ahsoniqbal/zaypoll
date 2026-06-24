import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  selectedOption: number | null;
  comment: string;
  setComment: (v: string) => void;
  onVote: () => void;
  isPending: boolean;
};

export default function VoteComposer({
  selectedOption,
  comment,
  setComment,
  onVote,
  isPending,
}: Props) {
  if (!selectedOption) return null; // ✅ only show after selection

  return (
    <div className="mt-4 space-y-2">
      <Textarea
        placeholder="Why did you choose this option?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={isPending}
          onClick={onVote}
        >
          {isPending ? "Submitting..." : "Vote"}
        </Button>
      </div>
    </div>
  );
}