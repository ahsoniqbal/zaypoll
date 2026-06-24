import PollForm from "@/components/poll/PollForm";
import { getTopics } from "@/services/topic.service";

export default async function CreatePollPage() {
  const topics = await getTopics();

  return (
  <div className="max-w-3xl mx-auto px-4 mt-6 pb-12">
      <PollForm topics={topics} />
    </div>
  );
}
