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
        {/* <p className="mt-1 text-sm text-muted-foreground">Choose a community to see its latest discussions.</p> */}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="group flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 shadow-[0_1px_2px_rgba(20,20,20,0.03)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.025] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/10">
              {topic.iconUrl ? (
                // Icon hosts are stored in the database and may vary by topic.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={topic.iconUrl}
                  alt=""
                  className="size-5 object-contain transition-transform group-hover:scale-110"
                />
              ) : (
                topic.name.slice(0, 1).toUpperCase()
              )}
            </span>
            <h3 className="min-w-0 truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
              {topic.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
