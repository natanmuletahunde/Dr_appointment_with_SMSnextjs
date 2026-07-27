import { NotificationList } from "@/components/notifications/NotificationList";
import { PageHeader } from "@/components/shared/PageHeader";
import { listNotifications } from "@/lib/services/notification.service";

export default async function AdminNotificationsPage() {
  const result = await listNotifications("admin", { pageSize: 50 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Notifications"
        description="In-app alerts for the admin inbox."
      />
      <NotificationList notifications={result.items} userId="admin" />
    </div>
  );
}
