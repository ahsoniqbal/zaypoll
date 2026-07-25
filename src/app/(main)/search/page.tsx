import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { EmptyState } from "@/components/PageMessage";
import Pagination from "@/components/Pagination";
import PollFeed from "@/components/poll/PollFeed";
import UserSearchResults from "@/components/search/UserSearchResults";
import { searchPolls } from "@/services/poll.services";
import { searchUsers } from "@/services/search-user.service";

type SearchType = "top" | "polls" | "people";

const SEARCH_LIMIT = 10;
const TOP_PREVIEW_LIMIT = 5;

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function searchUrl(query: string, type: SearchType, page?: number) {
  const params = new URLSearchParams({ q: query });
  if (type !== "top") params.set("type", type);
  if (page && page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "";
  const type: SearchType =
    params.type === "polls" || params.type === "people" ? params.type : "top";
  const page = parsePage(params.page);

  if (!query) {
    return (
      <main className="content-shell">
        <EmptyState
          title="Search Zaypoll"
          description="Search for polls, discussions, and people."
        />
      </main>
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const pollPage = type === "polls" ? page : 1;
  const peoplePage = type === "people" ? page : 1;
  const resultLimit = type === "top" ? TOP_PREVIEW_LIMIT : SEARCH_LIMIT;

  const [polls, people] = await Promise.all([
    searchPolls(userId, query, pollPage, resultLimit),
    searchUsers(query, peoplePage, resultLimit),
  ]);

  const selectedTotalPages = type === "people" ? people.totalPages : polls.totalPages;
  if (type !== "top" && selectedTotalPages > 0 && page > selectedTotalPages) {
    redirect(searchUrl(query, type, selectedTotalPages));
  }

  const tabs: Array<{ label: string; value: SearchType; count?: number }> = [
    { label: "Top", value: "top" },
    { label: "Polls", value: "polls", count: polls.total },
    { label: "People", value: "people", count: people.total },
  ];

  return (
    <main className="content-shell space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Results for <span className="text-muted-foreground">“{query}”</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {polls.total + people.total} matching{" "}
          {polls.total + people.total === 1 ? "result" : "results"}
        </p>
      </div>

      <nav aria-label="Search result types" className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const active = type === tab.value;
          return (
            <Link
              key={tab.value}
              href={searchUrl(query, tab.value)}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {type === "top" && (
        <div className="space-y-7">
          {people.data.length > 0 && (
            <section aria-labelledby="people-preview-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="people-preview-heading" className="font-semibold">People</h2>
                {people.total > TOP_PREVIEW_LIMIT && (
                  <Link href={searchUrl(query, "people")} className="text-sm font-medium text-primary hover:underline">
                    View all
                  </Link>
                )}
              </div>
              <UserSearchResults users={people.data} />
            </section>
          )}

          {polls.data.length > 0 && (
            <section aria-labelledby="poll-preview-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="poll-preview-heading" className="font-semibold">Polls</h2>
                {polls.total > TOP_PREVIEW_LIMIT && (
                  <Link href={searchUrl(query, "polls")} className="text-sm font-medium text-primary hover:underline">
                    View all
                  </Link>
                )}
              </div>
              <PollFeed
                polls={polls.data}
                page={1}
                totalPages={1}
                hasNext={false}
                hasPrev={false}
                isUserLoggedIn={!!userId}
                basePath="/search"
              />
            </section>
          )}

          {polls.total === 0 && people.total === 0 && (
            <EmptyState
              title="No matching results"
              description="Try a shorter, differently spelled, or more general search term."
              actionHref="/explore"
              actionLabel="Explore topics"
            />
          )}
        </div>
      )}

      {type === "polls" && (
        polls.data.length > 0 ? (
          <PollFeed
            polls={polls.data}
            page={polls.page}
            totalPages={polls.totalPages}
            hasNext={polls.hasNext}
            hasPrev={polls.hasPrev}
            isUserLoggedIn={!!userId}
            basePath="/search"
            query={{ q: query, type: "polls" }}
          />
        ) : (
          <EmptyState
            title="No matching polls"
            description="Try a shorter or more general search term."
            actionHref="/explore"
            actionLabel="Explore topics"
          />
        )
      )}

      {type === "people" && (
        people.data.length > 0 ? (
          <>
            <UserSearchResults users={people.data} />
            <Pagination
              page={people.page}
              totalPages={people.totalPages}
              basePath="/search"
              query={{ q: query, type: "people" }}
            />
          </>
        ) : (
          <EmptyState
            title="No matching people"
            description="Try searching by a display name or username."
          />
        )
      )}
    </main>
  );
}
