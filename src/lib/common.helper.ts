import { Notification } from "@/types/notification.types";

export function getNotificationMessage(n: Notification): string {
  switch (n.type) {
    case "REASON_ADDED":
      return `${n.actor_username} added a reason on your poll`;

    case "POLL_VOTED":
      return `${n.actor_username} voted on your poll`;
    case "POLL_REACTED":
      return `${n.actor_username} reacted to your poll`;

    case "USER_FOLLOWED":
      return `${n.actor_username} started following you`;

    case "COMMENT_REACTED":
      return `${n.actor_username} reacted to your comment`;
      
    default:
      return "New notification";
  }
}