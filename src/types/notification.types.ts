export type NotificationType =
    | "USER_FOLLOWED"
    | "POLL_VOTED"
    | "POLL_REACTED"
    | "REASON_ADDED"
    | "COMMENT_REACTED";

// export type NotificationData = {
//     pollId?: number;
//     reasonId?: number;
//     userId?: number;
// };


// export type NotificationData =
//   | { type: "USER_FOLLOWED"; userId: number; actorName: string }
//   | { type: "POLL_VOTED"; pollId: number; actorName: string }
//   | { type: "POLL_REACTED"; pollId: number; vote: number; actorName: string }
//   | { type: "REASON_ADDED"; pollId: number; reasonId: number; actorName: string }
//   | { type: "COMMENT_REACTED"; pollId: number; reasonId: number; actorName: string };


export type NotificationData =
  | { type: "POLL_REACTED"; pollId: number; vote: number; userId: number }
  | { type: "REASON_ADDED"; pollId: number; reasonId: number }
  | { type: "POLL_CREATED"; pollId: number }
  | { type: "COMMENT_REACTED"; reasonId: number; userId: number, vote: number; };

export type Notification = {
    id: number;
    type: NotificationType;
    is_read: number;
    created_at: string;
    actor_username?: string;
    data?: NotificationData;
};


