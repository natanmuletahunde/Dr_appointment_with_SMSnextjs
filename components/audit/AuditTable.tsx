import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogEntry } from "@/types/domain";

type AuditTableProps = {
  entries: AuditLogEntry[];
};

export function AuditTable({ entries }: AuditTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No audit events"
        description="Login, updates, and exports will appear in this log."
      />
    );
  }

  return (
    <div className="data-table">
      <Table className="shad-table">
        <TableHeader className="bg-dark-200">
          <TableRow className="shad-table-row-header">
            <TableHead>When</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.$id} className="shad-table-row">
              <TableCell className="text-14-regular whitespace-nowrap">
                {formatDateTime(entry.$createdAt).dateTime}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-14-medium">{entry.actorId}</span>
                  <Badge variant="outline" className="w-fit capitalize">
                    {entry.actorRole}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {entry.action}
                </Badge>
              </TableCell>
              <TableCell className="text-14-regular">
                <span className="text-dark-700">{entry.resourceType}</span>
                <br />
                <span className="font-mono text-12-regular text-dark-600">
                  {entry.resourceId}
                </span>
              </TableCell>
              <TableCell className="max-w-xs text-14-regular text-dark-700">
                {entry.summary}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
