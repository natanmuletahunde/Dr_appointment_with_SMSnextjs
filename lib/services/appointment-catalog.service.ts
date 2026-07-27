import type {
  AppointmentRecord,
  AppointmentStatus,
  PaginatedResult,
  SearchFilters,
} from "@/types/domain";
import {
  createDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";

function matchesQuery(appt: AppointmentRecord, query?: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    appt.patientName.toLowerCase().includes(q) ||
    appt.primaryPhysician.toLowerCase().includes(q) ||
    appt.reason.toLowerCase().includes(q) ||
    (appt.note ?? "").toLowerCase().includes(q) ||
    appt.$id.toLowerCase().includes(q)
  );
}

function statusMatch(
  status: AppointmentStatus,
  filter?: AppointmentStatus | AppointmentStatus[]
): boolean {
  if (!filter) return true;
  if (Array.isArray(filter)) return filter.includes(status);
  return status === filter;
}

export async function mirrorAppointment(
  appt: AppointmentRecord
): Promise<AppointmentRecord> {
  const existing = await queryDocuments<
    AppointmentRecord & { $id: string; $createdAt: string; $updatedAt: string }
  >("appointment_mirror", (doc) => doc.$id === appt.$id);

  if (existing.documents[0]) {
    return (await updateDocument(
      "appointment_mirror",
      appt.$id,
      appt as unknown as Record<string, unknown>
    )) as unknown as AppointmentRecord;
  }

  return (await createDocument(
    "appointment_mirror",
    {
      userId: appt.userId,
      patientId: appt.patientId,
      patientName: appt.patientName,
      patientEmail: appt.patientEmail,
      patientPhone: appt.patientPhone,
      primaryPhysician: appt.primaryPhysician,
      doctorId: appt.doctorId,
      reason: appt.reason,
      note: appt.note,
      schedule: appt.schedule,
      status: appt.status,
      cancellationReason: appt.cancellationReason,
      durationMinutes: appt.durationMinutes,
      location: appt.location,
      tags: appt.tags ?? [],
    },
    appt.$id
  )) as unknown as AppointmentRecord;
}

export async function searchAppointments(
  filters: SearchFilters = {}
): Promise<PaginatedResult<AppointmentRecord>> {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);
  const offset = (page - 1) * pageSize;
  const sortBy = filters.sortBy ?? "schedule";
  const sortDir = filters.sortDir ?? "desc";

  const { documents, total } = await queryDocuments<
    AppointmentRecord & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "appointment_mirror",
    (doc) => {
      if (!matchesQuery(doc, filters.query)) return false;
      if (!statusMatch(doc.status, filters.status)) return false;
      if (
        filters.doctor &&
        doc.primaryPhysician.toLowerCase() !== filters.doctor.toLowerCase()
      )
        return false;
      if (filters.patientId && doc.patientId !== filters.patientId) return false;
      if (filters.userId && doc.userId !== filters.userId) return false;
      if (filters.from && doc.schedule < filters.from) return false;
      if (filters.to && doc.schedule > filters.to) return false;
      return true;
    },
    {
      sort: (a, b) => {
        const av =
          sortBy === "createdAt"
            ? a.$createdAt
            : sortBy === "status"
              ? a.status
              : sortBy === "patientName"
                ? a.patientName
                : a.schedule;
        const bv =
          sortBy === "createdAt"
            ? b.$createdAt
            : sortBy === "status"
              ? b.status
              : sortBy === "patientName"
                ? b.patientName
                : b.schedule;
        const cmp = String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      },
      offset,
      limit: pageSize,
    }
  );

  return {
    items: documents,
    total,
    page,
    pageSize,
    hasMore: offset + documents.length < total,
  };
}

export async function listAppointmentsForUser(
  userId: string
): Promise<AppointmentRecord[]> {
  const result = await searchAppointments({
    userId,
    pageSize: 100,
    sortBy: "schedule",
    sortDir: "desc",
  });
  return result.items;
}

export async function listAllMirroredAppointments(): Promise<
  AppointmentRecord[]
> {
  const result = await searchAppointments({ pageSize: 1000, page: 1 });
  return result.items;
}
