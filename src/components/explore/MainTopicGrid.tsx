import Link from "next/link";
import { TopicDto } from "@/dto/category.dtos";

type Props = {
  topics: TopicDto[];
};

export default function MainTopicGrid({ topics }: Props) {
  return (
    <section aria-labelledby="main-topics-heading">
      <div className="mb-4">
        <h2 id="main-topics-heading" className="text-xl font-semibold tracking-tight">Main topics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a community to see its latest discussions.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="group rounded-xl border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
              {topic.name.slice(0, 1).toUpperCase()}
            </div>
            <h3 className="mt-4 font-medium text-foreground group-hover:text-primary">{topic.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {topic.childCount ? `${topic.childCount} sub-topic${topic.childCount === 1 ? "" : "s"}` : "Explore discussion"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
