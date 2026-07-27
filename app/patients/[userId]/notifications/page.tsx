import { PatientShell } from "@/components/layout/PatientShell";
import { NotificationList } from "@/components/notifications/NotificationList";
import { PageHeader } from "@/components/shared/PageHeader";
import { listNotifications } from "@/lib/services/notification.service";

type PageProps = {
  params: { userId: string };
};

export default async function PatientNotificationsPage({ params }: PageProps) {
  const { userId } = params;
  const result = await listNotifications(userId, { pageSize: 50 });

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Notifications"
          description="Reminders and updates about your care."
        />
        <NotificationList notifications={result.items} userId={userId} />
      </div>
    </PatientShell>
  );
}
