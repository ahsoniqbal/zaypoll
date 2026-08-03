import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { TopicDto } from "@/dto/category.dtos";
import { getParentTopics } from "@/services/topic.service";
import { Card, CardContent, CardHeader } from "./ui/card";
import ProfileCompletionCard from "./profile/ProfileCompletionCard";
import PopularAccountsCard from "./user/PopularAccountsCard";
import type { PopularAccount } from "@/types/user.types";

const VISIBLE_TOPIC_COUNT = 5;

function TopicItem({ topic }: { topic: TopicDto }) {
  return (
    <li>
      <Link
        href={`/topics/${topic.slug}`}
        className="group/topic flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-xs font-semibold text-primary">
          {topic.iconUrl ? (
            // Topic icon hosts are data-driven, so Next Image cannot safely enumerate them.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={topic.iconUrl} alt="" className="size-4 object-contain" />
          ) : (
            topic.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="min-w-0 truncate font-medium">
          {topic.name}
        </span>
      </Link>
    </li>
  );
}

export default async function RightSidebar({
  popularAccounts,
  isLoggedIn,
}: {
  popularAccounts: PopularAccount[];
  isLoggedIn: boolean;
}) {
  const topics = await getParentTopics();
  const visibleTopics = topics.slice(0, VISIBLE_TOPIC_COUNT);
  const remainingTopics = topics.slice(VISIBLE_TOPIC_COUNT);

  return (
    <aside className="sticky top-20 mt-4 hidden h-fit w-60 shrink-0 flex-col space-y-4 lg:flex">
      <ProfileCompletionCard />
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-3 py-2.5">
          <h2 className="text-sm font-semibold">Main topics</h2>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-10rem)] overflow-y-auto p-1.5">
          {topics.length > 0 ? (
            <nav aria-label="Main topics">
              <ul>
                {visibleTopics.map((topic) => (
                  <TopicItem key={topic.id} topic={topic} />
                ))}
              </ul>
              {remainingTopics.length > 0 && (
                <details className="group/disclosure">
                  <ul>
                    {remainingTopics.map((topic) => (
                      <TopicItem key={topic.id} topic={topic} />
                    ))}
                  </ul>
                  <summary className="mt-0.5 flex cursor-pointer list-none items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    <span className="group-open/disclosure:hidden">Show more</span>
                    <span className="hidden group-open/disclosure:inline">Show less</span>
                    <ChevronDown className="size-3.5 transition-transform group-open/disclosure:rotate-180" />
                  </summary>
                </details>
              )}
            </nav>
          ) : (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No topics available.
            </p>
          )}
        </CardContent>
      </Card>
      <PopularAccountsCard
        initialAccounts={popularAccounts}
        isLoggedIn={isLoggedIn}
      />
    </aside>
  );
}
