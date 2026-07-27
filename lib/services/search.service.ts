import { listAllMirroredAppointments } from "@/lib/services/appointment-catalog.service";
import { listDoctors } from "@/lib/services/doctor.service";
import { listAuditLogs } from "@/lib/services/audit.service";
import { listNotifications } from "@/lib/services/notification.service";
import type {
  AppointmentRecord,
  AuditLogEntry,
  DoctorProfile,
  NotificationItem,
} from "@/types/domain";

export type GlobalSearchResult = {
  appointments: AppointmentRecord[];
  doctors: DoctorProfile[];
  audit: AuditLogEntry[];
  notifications: NotificationItem[];
};

function matchesQuery(haystack: string | undefined | null, q: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(q);
}

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { appointments: [], doctors: [], audit: [], notifications: [] };
  }

  const [appointments, doctors, auditPage, notificationsPage] =
    await Promise.all([
      listAllMirroredAppointments(),
      listDoctors(),
      listAuditLogs({ pageSize: 50, page: 1 }),
      listNotifications("admin", { pageSize: 100, page: 1 }),
    ]);

  return {
    appointments: appointments.filter(
      (a) =>
        matchesQuery(a.patientName, q) ||
        matchesQuery(a.primaryPhysician, q) ||
        matchesQuery(a.reason, q) ||
        matchesQuery(a.$id, q)
    ),
    doctors: doctors.filter(
      (d) => matchesQuery(d.name, q) || matchesQuery(d.specialty, q)
    ),
    audit: auditPage.items.filter((entry) => matchesQuery(entry.summary, q)),
    notifications: notificationsPage.items.filter(
      (n) =>
        matchesQuery(n.title, q) ||
        matchesQuery(n.body, q) ||
        matchesQuery(n.type, q)
    ),
  };
}
