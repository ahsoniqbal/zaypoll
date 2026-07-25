import { searchPolls } from "@/services/poll.services";
import PollFeed from "@/components/poll/PollFeed";
import { auth } from "@/auth";
import { EmptyState } from "@/components/PageMessage";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const params = await searchParams;

    const query = params.q?.trim() || "";
    const page = Number(params.page || 1);

    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Handle empty search
    if (!query) {
        return (
            <main className="content-shell">
              <EmptyState title="Search Zaypoll" description="Use the search field above to find polls and discussions." />
            </main>
        );
    }

    const polls = await searchPolls(
        userId,
        query,
        page,
        10
    );      


    return (
        <main className="content-shell space-y-6">

            {/* ✅ Search Title */}
            <h1 className="text-xl font-semibold tracking-tight">
                Results for <span className="text-muted-foreground">“{query}”</span>
            </h1>

            {/* ✅ No results */}
            {polls.data.length === 0 ? (
                <EmptyState title="No matching polls" description="Try a shorter or more general search term." actionHref="/explore" actionLabel="Explore topics" />
            ) : (
                <PollFeed
                    polls={polls.data}
                    page={polls.page}
                    totalPages={polls.totalPages}
                    hasNext={polls.hasNext}
                    hasPrev={polls.hasPrev}
                    isUserLoggedIn={!!userId}
                    basePath="/search"
                    query={{ q: query }} // ✅ keep search in pagination
                />
            )}
        </main>
    );
}
