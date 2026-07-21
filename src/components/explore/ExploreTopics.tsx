import { TopicDto } from "@/dto/category.dtos";
import MainTopicGrid from "./MainTopicGrid";
import TopicSearchCombobox from "./TopicSearchCombobox";

type Props = {
  parentTopics: TopicDto[];
  searchableTopics: TopicDto[];
};

export default function ExploreTopics({ parentTopics, searchableTopics }: Props) {
  return (
    <>
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-7">
        <p className="text-sm font-medium text-primary">Explore communities</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Find the conversations that matter to you.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Browse public polls by topic, or search for a specific community and its sub-topics.
        </p>
        <TopicSearchCombobox topics={searchableTopics} />
      </section>

      <MainTopicGrid topics={parentTopics} />
    </>
  );
}
