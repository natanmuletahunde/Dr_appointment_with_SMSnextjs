import { JobsTable } from "@/components/jobs/JobsTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { listJobs } from "@/lib/services/job.service";

export default async function AdminJobsPage() {
  const jobs = await listJobs({ limit: 50 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Background jobs"
        description="Reminders, digests, exports, and other queued work."
      />
      <JobsTable jobs={jobs} />
    </div>
  );
}
