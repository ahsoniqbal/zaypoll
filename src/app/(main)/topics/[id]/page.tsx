import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PollFeed from "@/components/poll/PollFeed";
import SubtopicChips from "@/components/topic/SubtopicChips";
import { getCurrentUser } from "@/lib/server/auth.utils";
import { getPolls } from "@/services/poll.services";
import { getSubTopics, getTopicById, getTopicBySlug } from "@/services/topic.service";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/types/constants";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { id: slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) return { title: "Topic not found" };

  const parentLabel = topic.parentName ? `${topic.parentName} · ` : "";
  return {
    title: `${topic.name} polls`,
    description: `Explore public polls and discussion about ${parentLabel}${topic.name}.`,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const [{ id: slug }, query] = await Promise.all([params, searchParams]);
  const [topic, user] = await Promise.all([getTopicBySlug(slug), getCurrentUser()]);

  if (!topic) notFound();

  const parentTopic = topic.parentId ? await getTopicById(topic.parentId) : topic;
  if (!parentTopic) notFound();

  const subTopics = await getSubTopics(parentTopic.id);
  const isParentTopic = topic.id === parentTopic.id;
  const topicIds = isParentTopic ? [parentTopic.id, ...subTopics.map((subTopic) => subTopic.id)] : topic.id;
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
  const polls = await getPolls(user?.id ?? null, page, DEFAULT_PAGE_LIMIT, "for_you", topicIds, "latest");

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground">Explore</Link>
        {topic.parentName && <><span>/</span><Link href={`/topics/${parentTopic.slug}`} className="hover:text-foreground">{parentTopic.name}</Link></>}
        <span>/</span><span className="text-foreground">{topic.name}</span>
      </nav>

      <header>
        <p className="text-sm font-medium text-primary">Topic</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{topic.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isParentTopic ? `All discussion in ${topic.name} and its sub-topics.` : `Polls tagged ${topic.name}.`}
        </p>
      </header>

      <SubtopicChips parentTopic={parentTopic} subTopics={subTopics} activeTopicId={topic.id} />

      <section aria-labelledby="topic-feed-heading" className="space-y-4">
        <div>
          <h2 id="topic-feed-heading" className="text-xl font-semibold">Latest polls</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vote, react, and add your perspective.</p>
        </div>
        <PollFeed
          polls={polls.data}
          page={polls.page}
          totalPages={polls.totalPages}
          hasNext={polls.hasNext}
          hasPrev={polls.hasPrev}
          isUserLoggedIn={!!user?.id}
          basePath={`/topics/${topic.slug}`}
        />
      </section>
    </main>
  );
}
