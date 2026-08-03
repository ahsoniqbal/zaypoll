import { RowDataPacket } from "mysql2";

export type User = {
    id: number;
    name: string;
    email: string;
    image: string | null;
    userName: string;
    createdAt: Date | string;
}

export type UserRow = RowDataPacket & {
    id: number;
    name: string;
    email: string;
    image: string | null;
    user_name: string;
    created_at: Date | string;
    joined_on: string;
    followers_count: number;
    following_count: number;
    is_following: number | null;
    age_group: AgeGroup | null;
    gender: Gender | null;
    profile_onboarding_prompted_at: Date | null;
};


export type SessionUser = {
    id: number;
    name: string;
    email: string;
    image: string | null;
    userName: string;
};


export type UserDetails = {
    id: number;
    name: string;
    email: string;
    image: string | null;
    userName: string;
    joinedOn: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    ageGroup: AgeGroup | null;
    gender: Gender | null;

}

export type AgeGroup = "under_18" | "18_24" | "25_34" | "35_44" | "45_54" | "55_plus";
export type Gender = "woman" | "man" | "non_binary" | "prefer_not_to_say";

export type ProfileCompletion = {
    name: string;
    ageGroup: AgeGroup | null;
    gender: Gender | null;
    hasBeenPrompted: boolean;
    isComplete: boolean;
};

export type UserStats = {
    totalPolls: number;
    totalVotes: number;
    totalComments: number;
}
