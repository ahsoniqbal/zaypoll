import PollForm from "@/components/poll/PollForm";
import { getTopics } from "@/services/topic.service";
import { getCurrentUser } from "@/lib/server/auth.utils";
import { redirect } from "next/navigation";

export default async function CreatePollPage() {
  const [topics, user] = await Promise.all([getTopics(), getCurrentUser()]);
  if (!user?.id) redirect("/?auth=login");

  return (
  <div className="max-w-3xl mx-auto px-4 mt-6 pb-12">
      <PollForm topics={topics} />
    </div>
  );
}
