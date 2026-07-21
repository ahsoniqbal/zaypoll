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

}

export type UserStats = {
    totalPolls: number;
    totalVotes: number;
    totalComments: number;
}
