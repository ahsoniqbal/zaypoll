import { Notification } from "@/types/notification.types";

export function getNotificationMessage(n: Notification): string {
  const actor = n.actor_username || "Someone";

  switch (n.type) {
    case "REASON_ADDED":
      return `${actor} added a reason to your poll`;

    case "POLL_VOTED":
      return `${actor} voted on your poll`;
    case "POLL_REACTED":
      return `${actor} reacted to your poll`;

    case "USER_FOLLOWED":
      return `${actor} started following you`;

    case "COMMENT_REACTED":
      return `${actor} reacted to your comment`;
      
    default:
      return "New notification";
  }
}

export function getNotificationHref(n: Notification): string | null {
  if (n.type === "USER_FOLLOWED" && n.actor_username) {
    return `/user/${encodeURIComponent(n.actor_username)}`;
  }

  const pollId =
    n.data && "pollId" in n.data ? n.data.pollId : n.related_poll_id;

  if (pollId) return `/polls/${pollId}`;
  if (n.reference_type === "POLL") return `/polls/${n.reference_id}`;

  return null;
}
