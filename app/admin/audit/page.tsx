import { AuditTable } from "@/components/audit/AuditTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { listAuditLogs } from "@/lib/services/audit.service";

export default async function AdminAuditPage() {
  const result = await listAuditLogs({ pageSize: 50 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Audit log"
        description={`${result.total} recorded event${result.total === 1 ? "" : "s"} across the clinic.`}
      />
      <AuditTable entries={result.items} />
    </div>
  );
}
