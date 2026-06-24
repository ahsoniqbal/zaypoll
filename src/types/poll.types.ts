import { RowDataPacket } from "mysql2";

export type PollRow = RowDataPacket & {
    poll_id: string,
    title: string, 
    content: string,
    total_votes: number,
    total_likes: number,
    created_at: Date,
    user_id: number,
    name: string,
    user_name: string
};
