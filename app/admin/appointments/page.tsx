import { Suspense } from "react";
import Link from "next/link";

import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingBlock } from "@/components/shared/LoadingBlock";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doctors } from "@/constants";
import { searchAppointments } from "@/lib/services/appointment-catalog.service";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/domain";

type PageProps = {
  searchParams: {
    query?: string;
    status?: string;
    doctor?: string;
    page?: string;
  };
};

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const query = searchParams.query ?? "";
  const statusParam = searchParams.status;
  const doctor = searchParams.doctor;
  const page = Number(searchParams.page ?? "1") || 1;

  const status =
    statusParam && statusParam !== "all"
      ? (statusParam as AppointmentStatus)
      : undefined;

  const result = await searchAppointments({
    query: query || undefined,
    status,
    doctor: doctor || undefined,
    page,
    pageSize: 20,
    sortBy: "schedule",
    sortDir: "desc",
  });

  const doctorNames = Doctors.map((d) => d.name);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Appointments"
        description={`${result.total} mirrored appointment${result.total === 1 ? "" : "s"}`}
      />

      <Suspense fallback={<LoadingBlock label="Loading filters…" />}>
        <AppointmentFilters
          doctors={doctorNames}
          initialQuery={query}
          initialStatus={statusParam ?? "all"}
          initialDoctor={doctor ?? "all"}
        />
      </Suspense>

      {result.items.length === 0 ? (
        <EmptyState
          title="No appointments match"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="data-table">
          <Table className="shad-table">
            <TableHeader className="bg-dark-200">
              <TableRow className="shad-table-row-header">
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((appt) => (
                <TableRow key={appt.$id} className="shad-table-row">
                  <TableCell>
                    <Link
                      href={`/admin/appointments/${appt.$id}`}
                      className="text-14-medium text-green-500 hover:underline"
                    >
                      {appt.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-14-regular">
                    {appt.primaryPhysician}
                  </TableCell>
                  <TableCell className="text-14-regular whitespace-nowrap">
                    {formatDateTime(appt.schedule).dateTime}
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize">
                      {appt.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-14-regular text-dark-700">
                    {appt.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(result.hasMore || page > 1) && (
        <div className="flex items-center justify-between text-14-regular text-dark-700">
          <span>
            Page {result.page} · {result.pageSize} per page
          </span>
          <div className="flex gap-3">
            {page > 1 ? (
              <Link
                href={`/admin/appointments?${new URLSearchParams({
                  ...(query ? { query } : {}),
                  ...(statusParam ? { status: statusParam } : {}),
                  ...(doctor ? { doctor } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="text-green-500 hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {result.hasMore ? (
              <Link
                href={`/admin/appointments?${new URLSearchParams({
                  ...(query ? { query } : {}),
                  ...(statusParam ? { status: statusParam } : {}),
                  ...(doctor ? { doctor } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="text-green-500 hover:underline"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
