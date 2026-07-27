import { createDocument, queryDocuments } from "@/lib/persistence/document-store";
import { computeAnalytics } from "@/lib/services/analytics.service";
import { writeAuditLog } from "@/lib/services/audit.service";
import { validationError } from "@/lib/errors";
import type {
  AppointmentRecord,
  BaseEntity,
  DoctorProfile,
} from "@/types/domain";

export type ReportType =
  | "daily_ops"
  | "doctor_utilization"
  | "cancellation";

export interface SavedReport extends BaseEntity {
  type: ReportType;
  title: string;
  payload: Record<string, unknown>;
  generatedBy: string;
}

export type DailyOpsReport = {
  type: "daily_ops";
  generatedAt: string;
  kpis: {
    totalAppointments: number;
    scheduled: number;
    pending: number;
    completed: number;
    cancelled: number;
    noShow: number;
    cancellationRate: number;
    completionRate: number;
    averageLeadTimeHours: number;
    busiestHour: number;
    peakDayOfWeek: number;
  };
  byDoctor: Array<{ doctor: string; count: number; scheduled: number }>;
  byStatus: Array<{ status: string; count: number }>;
};

export type DoctorUtilizationReport = {
  type: "doctor_utilization";
  generatedAt: string;
  doctors: Array<{
    doctor: string;
    specialty?: string;
    appointmentCount: number;
    scheduledOrCompleted: number;
    cancelled: number;
    utilizationShare: number;
  }>;
  totals: {
    appointments: number;
    activeDoctors: number;
  };
};

export type CancellationReport = {
  type: "cancellation";
  generatedAt: string;
  totals: {
    cancelled: number;
    total: number;
    cancellationRate: number;
  };
  byDoctor: Array<{ doctor: string; cancelled: number; total: number }>;
  byReason: Array<{ reason: string; count: number }>;
  recent: Array<{
    id: string;
    patientName: string;
    doctor: string;
    schedule: string;
    reason: string | null;
  }>;
};

export function generateDailyOpsReport(
  appointments: AppointmentRecord[]
): DailyOpsReport {
  const analytics = computeAnalytics(appointments, 1);
  return {
    type: "daily_ops",
    generatedAt: new Date().toISOString(),
    kpis: {
      totalAppointments: analytics.totals.appointments,
      scheduled: analytics.totals.scheduled,
      pending: analytics.totals.pending,
      completed: analytics.totals.completed,
      cancelled: analytics.totals.cancelled,
      noShow: analytics.totals.noShow,
      cancellationRate: analytics.cancellationRate,
      completionRate: analytics.completionRate,
      averageLeadTimeHours: analytics.averageLeadTimeHours,
      busiestHour: analytics.busiestHour,
      peakDayOfWeek: analytics.peakDayOfWeek,
    },
    byDoctor: analytics.byDoctor,
    byStatus: analytics.byStatus,
  };
}

export function generateDoctorUtilizationReport(
  appointments: AppointmentRecord[],
  doctors: DoctorProfile[]
): DoctorUtilizationReport {
  const specialtyByName = new Map(
    doctors.map((d) => [d.name.toLowerCase(), d.specialty] as const)
  );
  const total = appointments.length || 1;
  const byDoctor = new Map<
    string,
    { appointmentCount: number; scheduledOrCompleted: number; cancelled: number }
  >();

  for (const appt of appointments) {
    const key = appt.primaryPhysician;
    const stats = byDoctor.get(key) ?? {
      appointmentCount: 0,
      scheduledOrCompleted: 0,
      cancelled: 0,
    };
    stats.appointmentCount += 1;
    if (appt.status === "scheduled" || appt.status === "completed") {
      stats.scheduledOrCompleted += 1;
    }
    if (appt.status === "cancelled") stats.cancelled += 1;
    byDoctor.set(key, stats);
  }

  // Include doctors with zero appointments so utilization is complete
  for (const doctor of doctors) {
    if (!byDoctor.has(doctor.name)) {
      byDoctor.set(doctor.name, {
        appointmentCount: 0,
        scheduledOrCompleted: 0,
        cancelled: 0,
      });
    }
  }

  const rows = [...byDoctor.entries()]
    .map(([doctor, stats]) => ({
      doctor,
      specialty: specialtyByName.get(doctor.toLowerCase()),
      appointmentCount: stats.appointmentCount,
      scheduledOrCompleted: stats.scheduledOrCompleted,
      cancelled: stats.cancelled,
      utilizationShare: stats.appointmentCount / total,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount);

  return {
    type: "doctor_utilization",
    generatedAt: new Date().toISOString(),
    doctors: rows,
    totals: {
      appointments: appointments.length,
      activeDoctors: rows.filter((r) => r.appointmentCount > 0).length,
    },
  };
}

export function generateCancellationReport(
  appointments: AppointmentRecord[]
): CancellationReport {
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const byDoctorMap = new Map<string, { cancelled: number; total: number }>();
  const byReasonMap = new Map<string, number>();

  for (const appt of appointments) {
    const doc = byDoctorMap.get(appt.primaryPhysician) ?? {
      cancelled: 0,
      total: 0,
    };
    doc.total += 1;
    if (appt.status === "cancelled") doc.cancelled += 1;
    byDoctorMap.set(appt.primaryPhysician, doc);
  }

  for (const appt of cancelled) {
    const reason = (appt.cancellationReason || "Unspecified").trim();
    byReasonMap.set(reason, (byReasonMap.get(reason) ?? 0) + 1);
  }

  return {
    type: "cancellation",
    generatedAt: new Date().toISOString(),
    totals: {
      cancelled: cancelled.length,
      total: appointments.length,
      cancellationRate:
        appointments.length === 0 ? 0 : cancelled.length / appointments.length,
    },
    byDoctor: [...byDoctorMap.entries()]
      .map(([doctor, stats]) => ({ doctor, ...stats }))
      .sort((a, b) => b.cancelled - a.cancelled),
    byReason: [...byReasonMap.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
    recent: cancelled
      .slice()
      .sort(
        (a, b) =>
          new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime()
      )
      .slice(0, 25)
      .map((a) => ({
        id: a.$id,
        patientName: a.patientName,
        doctor: a.primaryPhysician,
        schedule: a.schedule,
        reason: a.cancellationReason ?? null,
      })),
  };
}

export async function saveReport(
  type: ReportType,
  payload: Record<string, unknown>,
  generatedBy = "admin"
): Promise<SavedReport> {
  const titles: Record<ReportType, string> = {
    daily_ops: "Daily operations report",
    doctor_utilization: "Doctor utilization report",
    cancellation: "Cancellation report",
  };

  const report = (await createDocument("reports", {
    type,
    title: titles[type],
    payload,
    generatedBy,
  })) as unknown as SavedReport;

  await writeAuditLog({
    actorId: generatedBy,
    actorRole: "admin",
    action: "export",
    resourceType: "report",
    resourceId: report.$id,
    summary: `Generated ${titles[type]}`,
  });

  return report;
}

export async function listSavedReports(): Promise<SavedReport[]> {
  const { documents } = await queryDocuments<SavedReport>(
    "reports",
    () => true,
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    }
  );
  return documents;
}

export async function generateAndSaveReport(
  type: ReportType,
  appointments: AppointmentRecord[],
  doctors: DoctorProfile[] = [],
  generatedBy = "admin"
): Promise<SavedReport> {
  let payload: Record<string, unknown>;

  switch (type) {
    case "daily_ops":
      payload = generateDailyOpsReport(appointments) as unknown as Record<
        string,
        unknown
      >;
      break;
    case "doctor_utilization":
      payload = generateDoctorUtilizationReport(
        appointments,
        doctors
      ) as unknown as Record<string, unknown>;
      break;
    case "cancellation":
      payload = generateCancellationReport(appointments) as unknown as Record<
        string,
        unknown
      >;
      break;
    default:
      throw validationError(`Unknown report type: ${type}`);
  }

  return saveReport(type, payload, generatedBy);
}
