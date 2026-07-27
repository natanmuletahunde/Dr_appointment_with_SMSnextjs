"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { processJobsAction } from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type { BackgroundJob, JobStatus } from "@/types/domain";

const STATUS_VARIANT: Record<
  JobStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  queued: "outline",
  running: "warning",
  completed: "success",
  failed: "destructive",
  cancelled: "secondary",
};

type JobsTableProps = {
  jobs: BackgroundJob[];
};

export function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="shad-primary-btn"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await processJobsAction(10);
              router.refresh();
            });
          }}
        >
          {pending ? "Processing…" : "Process due jobs"}
        </Button>
        <p className="text-14-regular text-dark-700">
          Runs up to 10 queued jobs whose run time has passed.
        </p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No background jobs"
          description="Reminders, digests, and exports will show up here when enqueued."
        />
      ) : (
        <div className="data-table">
          <Table className="shad-table">
            <TableHeader className="bg-dark-200">
              <TableRow className="shad-table-row-header">
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Run at</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Last error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.$id} className="shad-table-row">
                  <TableCell className="text-14-medium capitalize">
                    {job.type.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[job.status]}
                      className="capitalize"
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-14-regular whitespace-nowrap">
                    {formatDateTime(job.runAt).dateTime}
                  </TableCell>
                  <TableCell className="text-14-regular">
                    {job.attempts}/{job.maxAttempts}
                  </TableCell>
                  <TableCell className="max-w-xs text-14-regular text-red-500">
                    {job.lastError || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
