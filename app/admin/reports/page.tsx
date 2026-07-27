import { ReportCards } from "@/components/reports/ReportCards";
import { PageHeader } from "@/components/shared/PageHeader";
import { listSavedReports } from "@/lib/services/report.service";

export default async function AdminReportsPage() {
  const reports = await listSavedReports();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Reports"
        description="Generate operational reports from mirrored appointments and archive them locally."
      />
      <ReportCards reports={reports} />
    </div>
  );
}
