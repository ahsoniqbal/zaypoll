import { auth } from "@/auth";
import PollDetails from "@/components/poll/PollDetails";
import { getPollById, getPollReasons } from "@/services/poll.services";
import { getPollAnalytics } from "@/services/poll-analytics.service";
import type { AnalyticsTab } from "@/types/poll-analytics.types";
import AppError from "next/dist/client/components/builtin/app-error";
import { notFound } from "next/navigation";

export default async function PollPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
    const { id } = await params;
    const requestedTab = (await searchParams).tab;
    const initialTab: AnalyticsTab = requestedTab === "analytics" ? "analytics" : "reasons";

    const session = await auth();
    const userId = session?.user?.id ?? null;

    let poll;
    let initialReasons;
    let analytics;

    try {
        if (!id) throw new Error("Poll id is null");

        poll = await getPollById(userId, parseInt(id));

        [initialReasons, analytics] = await Promise.all([
            getPollReasons(poll.pollId, userId, null, "top", 20),
            getPollAnalytics(poll.pollId),
        ]);

    } catch (err) {
        if (err instanceof AppError) {
            notFound();
        }
        throw err;
    }

    return <PollDetails poll={poll} isUserLoggedIn={!!userId} initialReasons={initialReasons} analytics={analytics} initialTab={initialTab} canRefreshInsights={userId === poll.user.id} />;

}
