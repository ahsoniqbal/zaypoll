"use server";

import { auth } from "@/auth";
import { AppError } from "@/lib/error";
import { createUser, deleteUser, dismissProfileOnboarding, toggleFollow, updateUser, updateUserProfile } from "@/services/user.services";
import { ActionResponse } from "@/types/common.types";
import { revalidatePath } from "next/cache";
import { z } from "zod";



type ToggleFollowResponse = {
    success: boolean;
    isFollowing?: boolean;
    message?: string;
};

export async function toggleFollowAction(
    followingId: number
): Promise<ToggleFollowResponse> {
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    try {
        const session = await auth();

        if (!session?.user?.id) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        const followerId = Number(session.user.id);

        const result = await toggleFollow(followerId, followingId);

        // Optional: revalidate user profile page
        revalidatePath(`/user/[username]`, "page");

        return {
            success: true,
            isFollowing: result.isFollowing,
        };
    } catch (error) {
        if (error instanceof AppError) {
            return {
                success: false,
                message: error.message,
            };
        }

        console.error("toggleFollowAction error:", error);

        return {
            success: false,
            message: "Something went wrong",
        };
    }
}


export async function getUserAction(id: number): Promise<ActionResponse> {
    try {
        await deleteUser(id);
        revalidatePath("/users");
        return { success: true, message: "User Deleted" };
    } catch (error) {
        if (error instanceof AppError) {
            return { success: false, message: error.message };
        }
        console.error("UPDATE_ERROR:", error);
        throw new Error("Something went wrong");

    }
}

export async function createUserAction(formData: FormData): Promise<ActionResponse> {
    try {
        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        if (!username || !password) {
            throw new AppError("All fields are required");
        }

        await createUser({ username, password });
        revalidatePath("/users");
        return { success: true, message: "User created" };

    } catch (error) {
        if (error instanceof AppError) {
            return { success: false, message: error.message };
        }

        console.error("CREATE_ERROR:", error);
        throw new Error("Something went wrong");
    }
}

export async function updateUserAction(id: number, formData: FormData): Promise<ActionResponse> {
    try {
        const username = formData.get('username')?.toString();
        const password = formData.get('password')?.toString();

        if (!username || !password) {
            throw new AppError("All fields are required");
        }

        await updateUser(id, { username, password });
        revalidatePath("/users");
        return { success: true, message: "User Updated" };

    } catch (error) {
        if (error instanceof AppError) {
            return { success: false, message: error.message };
        }
        console.error("UPDATE_ERROR:", error);
        throw new Error("Something went wrong");

    }
}

export async function deleteUserAction(id: number): Promise<ActionResponse> {
    try {

        // ✅ intentional delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        await deleteUser(id);
        revalidatePath("/users");
        return { success: true, message: "User Deleted" };
    } catch (error) {
        if (error instanceof AppError) {
            return { success: false, message: error.message };
        }
        console.error("UPDATE_ERROR:", error);
        throw new Error("Something went wrong");

    }

}



import { getFollowers, getFollowing } from "@/services/user.services";

export async function getFollowersAction(userId: number) {
    return await getFollowers(userId);
}

export async function getFollowingAction(userId: number) {
    return await getFollowing(userId);
}

const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
    ageGroup: z.enum(["under_18", "18_24", "25_34", "35_44", "45_54", "55_plus"], {
        error: "Select your age group",
    }),
    gender: z.enum(["woman", "man", "non_binary", "prefer_not_to_say"], {
        error: "Select a gender option",
    }),
});

export async function updateProfileAction(formData: FormData): Promise<ActionResponse> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { success: false, message: "Please sign in to update your profile" };
    }

    const parsed = profileSchema.safeParse({
        name: formData.get("name"),
        ageGroup: formData.get("ageGroup"),
        gender: formData.get("gender"),
    });
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Check your profile details" };
    }

    try {
        await updateUserProfile(Number(userId), {
            ...parsed.data,
        });
        revalidatePath("/", "layout");
        revalidatePath("/user/[username]", "page");
        return { success: true, message: "Profile updated successfully" };
    } catch (error) {
        console.error("updateProfileAction error:", error);
        return { success: false, message: "We couldn't update your profile. Please try again." };
    }
}

export async function dismissProfileOnboardingAction(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Please sign in to update your profile" };
    }
    try {
        await dismissProfileOnboarding(Number(session.user.id));
        revalidatePath("/", "layout");
        return { success: true, message: "You can complete your profile any time" };
    } catch (error) {
        console.error("dismissProfileOnboardingAction error:", error);
        return { success: false, message: "We couldn't save that preference. Please try again." };
    }
}
