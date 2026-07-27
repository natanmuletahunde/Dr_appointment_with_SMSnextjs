import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCachedAnalytics } from "@/lib/services/analytics.service";
import { listAllMirroredAppointments } from "@/lib/services/appointment-catalog.service";

export default async function AdminAnalyticsPage() {
  const appointments = await listAllMirroredAppointments();
  const analytics = await getCachedAnalytics(appointments, 30);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Clinic performance across mirrored appointments for the last 30 days."
      />
      <AnalyticsCharts data={analytics} />
    </div>
  );
}
