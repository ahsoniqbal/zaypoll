import { getPolls, searchPolls } from "@/services/poll.services";
import PollFeed from "@/components/poll/PollFeed";
import { auth } from "@/auth";

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

    console.log("Search query:", query);

    // Handle empty search
    if (!query) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500">
                Start typing in the search box to find polls 🔍
            </div>
        );
    }

    const polls = await searchPolls(
        userId,
        query,
        page,
        10
    );      


    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* ✅ Search Title */}
            <h1 className="text-xl font-semibold">
                Results for <span className="text-blue-500">"{query}"</span>
            </h1>

            {/* ✅ No results */}
            {polls.data.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-2">
                        No results found for "{query}"
                    </p>

                    <p className="text-sm text-gray-400">
                        Try different keywords or remove filters
                    </p>
                </div>
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
        </div>
    );
}