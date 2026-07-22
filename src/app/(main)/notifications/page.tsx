import { redirect } from "next/navigation";

import { fetchNotificationBundle } from "@/actions/notification.action";
import NotificationList from "@/components/notifications/NotificationList";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/server/auth.utils";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/?auth=login");

  const { notifications } = await fetchNotificationBundle();

  return (
    <main className="mt-4 w-full min-w-0 max-w-3xl flex-1">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <NotificationList initialNotifications={notifications} />
      </Card>
    </main>
  );
}
