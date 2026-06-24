import { getPolls } from "@/services/poll.services";
import { PollListingDto } from "@/dto/poll.dtos";
import PollList from "@/components/poll/PollList";
import { PagedResponse } from "@/types/common.types";
import ToastHandler from "@/components/ToastHandler";
import { auth } from "@/auth";
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/types/constants";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    feed?: "for_you" | "following";
    page?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;

  const feed = params.feed ?? "for_you";   // ✅ default fallback
  const page = params.page ?? "1";
  const success = params.success;

  const pageNumber = Number(page) || DEFAULT_PAGE;   // ✅ safer parse

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const result: PagedResponse<PollListingDto> =
    await getPolls(userId, pageNumber, DEFAULT_PAGE_LIMIT, feed, null, "latest");

  return (
    <main className="flex-1 max-w-3xl w-full mt-4 min-w-0">
      <ToastHandler message={success} />

      <PollList
        polls={result.data}
        page={result.page}
        totalPages={result.totalPages}
        hasNext={result.hasNext}
        hasPrev={result.hasPrev}
        isUserLoggedIn={!!userId}
        feed={feed}   // pass it down
      />
    </main>
  );
}
