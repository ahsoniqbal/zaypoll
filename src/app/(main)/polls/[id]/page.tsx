import { auth } from "@/auth";
import PollDetails from "@/components/poll/PollDetails";
import { getPollById, getPollReasons } from "@/services/poll.services";
import AppError from "next/dist/client/components/builtin/app-error";
import { notFound } from "next/navigation";

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id ?? null;

    try {
        if (!id) throw new Error("Poll id is null");

        const poll = await getPollById(userId, parseInt(id));

        const initialReasons = await getPollReasons(
            poll.pollId,
            userId,
            null,      // ALL reasons
            "top", 20);

        return <PollDetails poll={poll} isUserLoggedIn={!!userId}  initialReasons={initialReasons} />;
    } catch (err) {
        if (err instanceof AppError) {
            notFound();
        }
        throw err;
    }

}