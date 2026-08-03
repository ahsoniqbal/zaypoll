import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PollFeed from "@/components/poll/PollFeed";
import SubtopicChips from "@/components/topic/SubtopicChips";
import { getCurrentUser } from "@/lib/server/auth.utils";
import { getPolls } from "@/services/poll.services";
import {
  getSubTopics,
  getTopicAndDescendantIds,
  getTopicBySlug,
  getTopicPath,
} from "@/services/topic.service";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/types/constants";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { id: slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) return { title: "Topic not found" };

  const path = await getTopicPath(topic.id);
  const topicLabel = path.map((item) => item.name).join(" · ");
  return {
    title: `${topic.name} polls`,
    description: `Explore public polls and discussion about ${topicLabel}.`,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const [{ id: slug }, query] = await Promise.all([params, searchParams]);
  const [topic, user] = await Promise.all([getTopicBySlug(slug), getCurrentUser()]);

  if (!topic) notFound();

  const [subTopics, topicPath, topicIds] = await Promise.all([
    getSubTopics(topic.id),
    getTopicPath(topic.id),
    getTopicAndDescendantIds(topic.id),
  ]);
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
  const polls = await getPolls(user?.id ?? null, page, DEFAULT_PAGE_LIMIT, "for_you", topicIds, "latest");

  return (
    <main className="content-shell space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground">Explore</Link>
        {topicPath.map((pathTopic, index) => {
          const isCurrent = index === topicPath.length - 1;
          return (
            <span key={pathTopic.id} className="contents">
              <span>/</span>
              {isCurrent ? (
                <span className="text-foreground">{pathTopic.name}</span>
              ) : (
                <Link href={`/topics/${pathTopic.slug}`} className="hover:text-foreground">
                  {pathTopic.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* <header>
        <p className="text-sm font-medium text-primary">Topic</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{topic.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isParentTopic ? `All discussion in ${topic.name} and its sub-topics.` : `Polls tagged ${topic.name}.`}
        </p>
      </header> */}

      <SubtopicChips parentTopic={topic} subTopics={subTopics} activeTopicId={topic.id} />

      <section aria-labelledby="topic-feed-heading" className="space-y-4">
        {/* <div>
          <h2 id="topic-feed-heading" className="text-xl font-semibold">Latest polls</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vote, react, and add your perspective.</p>
        </div> */}
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
