"use server"

import { auth } from "@/auth";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notification.service";
import { revalidatePath } from "next/cache";

import { getNotificationBundle } from "@/services/notification.service";

/**
 * (RECOMMENDED) single optimized call for navbar
 */
export async function fetchNotificationBundle() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      notifications: [],
      unreadCount: 0,
    };
  }

  return await getNotificationBundle(session.user.id);
}

/**
 * fallback (if you still want separate calls)
 */
export async function fetchNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await getNotifications(session.user.id);
}

export async function fetchUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return await getUnreadCount(session.user.id);
}

export async function readNotification(notificationId: number) {
  const session = await auth();
  if (!session?.user?.id) return;

  const result = await markAsRead(session.user.id, notificationId);
  revalidatePath("/notifications");
  return result;
}

export async function readAllNotifications() {
  const session = await auth();
  if (!session?.user?.id) return;

  const result = await markAllAsRead(session.user.id);
  revalidatePath("/notifications");
  return result;
}
