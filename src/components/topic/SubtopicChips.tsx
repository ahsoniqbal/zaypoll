import Link from "next/link";
import { TopicDto } from "@/dto/category.dtos";

type Props = {
  parentTopic: TopicDto;
  subTopics: TopicDto[];
  activeTopicId: number;
};

export default function SubtopicChips({ parentTopic, subTopics, activeTopicId }: Props) {
  if (subTopics.length === 0) return null;

  return (
    <nav aria-label={`${parentTopic.name} sub-topics`} className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-2">
        <Link
          href={`/topics/${parentTopic.slug}`}
          aria-current={activeTopicId === parentTopic.id ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTopicId === parentTopic.id ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
        >
          All {parentTopic.name}
        </Link>
        {subTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            aria-current={activeTopicId === topic.id ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTopicId === topic.id ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            {topic.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
