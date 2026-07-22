"use server"

import { auth } from "@/auth";
import { CommentDto } from "@/dto/poll.dtos";
import { AppError } from "@/lib/error";
import { addReason, castVote, createPoll, getCommentsByOptionId, getPollReasons, toggleCommentReaction, togglePollReaction } from "@/services/poll.services";
import { ActionResponse } from "@/types/common.types";
import { revalidatePath } from "next/cache";
import {
    POLL_DESCRIPTION_MAX_LENGTH,
    POLL_MAX_OPTIONS,
    POLL_MAX_TOPICS,
    POLL_MIN_OPTIONS,
    POLL_OPTION_MAX_LENGTH,
    POLL_TITLE_MAX_LENGTH,
} from "@/types/constants";

export async function createPollAction(
    formData: FormData
): Promise<ActionResponse<{pollId: number}>> {

    const session = await auth();
    const userId = session?.user?.id;

    try {
        if (!userId) {
            throw new AppError("Unauthorized");
        }

        const title = formData.get("title")?.toString().trim() ?? "";
        const content = formData.get("content")?.toString().trim() ?? "";
        const topicIds = [...new Set(
            formData.getAll("topicIds").map((value) => Number(value))
        )];

        // extract options
        const options: string[] = [];

        for (const [key, value] of formData.entries()) {
            if (key.startsWith("options[")) {
                options.push(value.toString().trim());
            }
        }

        //validation
        if (!title) {
            throw new AppError("Poll title is required");
        }

        if (title.length > POLL_TITLE_MAX_LENGTH) {
            throw new AppError(`Title must be ${POLL_TITLE_MAX_LENGTH} characters or fewer`);
        }

        if (content.length > POLL_DESCRIPTION_MAX_LENGTH) {
            throw new AppError(`Description must be ${POLL_DESCRIPTION_MAX_LENGTH} characters or fewer`);
        }

        if (options.length < POLL_MIN_OPTIONS || options.length > POLL_MAX_OPTIONS) {
            throw new AppError(`Poll must have between ${POLL_MIN_OPTIONS} and ${POLL_MAX_OPTIONS} options`);
        }

        if (options.some((opt) => !opt)) {
            throw new AppError("Options cannot be empty");
        }

        if (options.some((option) => option.length > POLL_OPTION_MAX_LENGTH)) {
            throw new AppError(`Each option must be ${POLL_OPTION_MAX_LENGTH} characters or fewer`);
        }

        if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== options.length) {
            throw new AppError("Poll options must be unique");
        }

        if (topicIds.length > POLL_MAX_TOPICS) {
            throw new AppError(`You can select up to ${POLL_MAX_TOPICS} topics`);
        }

        if (topicIds.some((topicId) => !Number.isSafeInteger(topicId) || topicId <= 0)) {
            throw new AppError("Invalid topic selected");
        }

        const pollId = await createPoll({
            title,
            content,
            options,
            createdBy: userId,
            topicIds,
        });


        // Optional: still revalidate feed
        revalidatePath("/");

        // Redirect to details page
        return {
            success: true,
            message: "Poll created",
            data: { pollId }
        };

    } catch (error) {
        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message,
            };
        }
        console.log(error);
        throw new Error("Something went wrong");
    }

    // redirect("/?success=Posted");
}

export async function addReasonAction(pollId: number, optionId: number, reason: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        //Auth check
        if (!userId) {
            return { success: false, message: "Please login to add a reason" };
        }

        //Basic validation
        if (!pollId || !optionId) {
            return { success: false, message: "Invalid request", };
        }

        const trimmed = reason?.trim();

        if (!trimmed) {
            return { success: false, message: "Reason cannot be empty" };
        }

        if (trimmed.length > 150) {
            return { success: false, message: "Reason is too long", };
        }

        // Call service
        const insertedData = await addReason(userId, pollId, optionId, trimmed);

        //Revalidate only relevant page
        //revalidatePath(`/polls/${pollId}`);

        return {
            success: true,
            message: "Reason added successfully",
            data: insertedData
        };

    } catch (error) {
        // Known/business errors → safe message
        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message,
            }
        }
        // Unknown errors → log + trigger 500 page
        console.error("AddReasonAction Error:", error);
        throw error;
    }
}


export async function castVoteAction(pollId: number, optionId: number, isDetailsPage: boolean = false)
    : Promise<ActionResponse<{ optionId: number }>> {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new AppError("Unauthorized, Please login to cast the vote");
        }

        if (!pollId || !optionId) {
            throw new AppError("Please select option");
        }

        await castVote(userId, pollId, optionId);

        // A vote changes the viewer-specific state on feeds, topic pages, profiles,
        // and the poll detail page. Invalidate the root layout so returning to any
        // previously visited poll surface fetches the current vote state.
        revalidatePath("/", "layout");

        if (isDetailsPage) {
            revalidatePath("/polls/" + pollId);
        }
        return {
            success: true,
            message: "Vote Casted",
            data: {
                optionId
            }

        };

    } catch (error) {

        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message
            };
        }

        console.error(error);
        throw new Error("Something went wrong");
    }
}

export async function toggleReactionAction(
    pollId: number,
    vote: 1 | -1
): Promise<ActionResponse> {

    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new AppError("Please login to react to polls");
        }

        if (!pollId || (vote !== 1 && vote !== -1)) {
            throw new AppError("Invalid poll or vote value");
        }

        await togglePollReaction(userId, pollId, vote);

        // revalidatePath("/"); never use this in reactions as we follow fire-and-forget for better ui/ux

        return {
            success: true,
            message: vote === 1 ? "Upvoted" : "Downvoted"
        };

    } catch (error) {

        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message
            };
        }

        console.error(error);
        throw new Error("Something went wrong");
    }
}

export async function toggleCommentReactionAction(commentId: number, vote: 1 | -1): Promise<ActionResponse> {

    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new AppError("Please login to react to polls");
        }

        if (!commentId || (vote !== 1 && vote !== -1)) {
            throw new AppError("Invalid comment or vote value");
        }

        await toggleCommentReaction(userId, commentId, vote);

        // revalidatePath("/"); never use this in reactions as we follow fire-and-forget for better ui/ux

        return {
            success: true,
            message: vote === 1 ? "Upvoted" : "Downvoted"
        };

    } catch (error) {

        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message
            };
        }

        console.error(error);
        throw new Error("Something went wrong");
    }
}


export async function getPollReasonsAction(pollId: number, optionId: number | null,
    sortBy: "top" | "latest" = "top", page: number = 1): Promise<CommentDto[]> {

    const session = await auth();
    const userId = session?.user?.id ?? null;

    return getPollReasons(
        pollId,
        userId,
        optionId,
        sortBy,
        20,
        (page - 1) * 20
    );
}

export async function getCommentsByOptionIdAction(optionId: number, sortBy: "latest" | "top" = "top"): Promise<CommentDto[]> {
    if (!optionId) return [];
    const session = await auth();
    const userId = session?.user?.id ?? null;

    try {
        const result: CommentDto[] = await getCommentsByOptionId(optionId, userId, sortBy);
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Something went wrong");

    }
}
