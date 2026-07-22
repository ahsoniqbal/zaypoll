"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  readAllNotifications,
  readNotification,
} from "@/actions/notification.action";
import { Button } from "@/components/ui/button";
import { getNotificationHref, getNotificationMessage } from "@/lib/common.helper";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/notification.types";

export default function NotificationList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((notification) => !notification.is_read);

  const openNotification = (notification: Notification) => {
    if (!notification.is_read) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: 1 } : item
        )
      );
      startTransition(() => void readNotification(notification.id));
    }

    const href = getNotificationHref(notification);
    if (href) router.push(href);
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: 1 }))
    );
    startTransition(() => void readAllNotifications());
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted-foreground">
        <Bell className="h-8 w-8" />
        <div>
          <p className="font-medium text-foreground">No notifications yet</p>
          <p className="mt-1 text-sm">Updates about your polls and followers will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasUnread || isPending}
          onClick={markAllRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="divide-y">
        {notifications.map((notification) => {
          const href = getNotificationHref(notification);

          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => openNotification(notification)}
              className={cn(
                "flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/60",
                !notification.is_read && "bg-primary/5",
                !href && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "mt-2 h-2 w-2 shrink-0 rounded-full",
                  notification.is_read ? "bg-transparent" : "bg-primary"
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {getNotificationMessage(notification)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
