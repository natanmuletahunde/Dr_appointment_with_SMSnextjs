import { ensureDoctorsSeeded } from "@/lib/services/doctor.service";
import { getClinicSettings } from "@/lib/services/settings.service";
import { createNotification } from "@/lib/services/notification.service";
import { mirrorAppointment } from "@/lib/services/appointment-catalog.service";
import { enqueueJob } from "@/lib/services/job.service";
import { writeAuditLog } from "@/lib/services/audit.service";
import { recordMetric } from "@/lib/services/metrics.service";
import { submitApprovalRequest } from "@/lib/services/approval.service";
import { addAppointmentComment } from "@/lib/services/comment.service";
import { recordActivity } from "@/lib/services/activity.service";
import { logger } from "@/lib/logger";
import { addDays, setHours, setMinutes } from "date-fns";
import type { AppointmentRecord } from "@/types/domain";

/**
 * Seeds local store with realistic clinic operational data for demos/dev.
 * Doctors/settings are idempotent; sample appointments use stable ids.
 */
export async function seedPlatformData() {
  logger.info("seed.start");

  const doctors = await ensureDoctorsSeeded();
  const settings = await getClinicSettings();

  await createNotification({
    userId: "admin",
    title: "Clinic workspace ready",
    body: `${settings.clinicName} local data store is initialized with ${doctors.length} doctors.`,
    type: "system",
    href: "/admin",
  });

  const samplePatients = [
    { userId: "seed_user_1", name: "Amelia Hart", email: "amelia@example.com" },
    { userId: "seed_user_2", name: "Noah Blake", email: "noah@example.com" },
    { userId: "seed_user_3", name: "Sofia Reyes", email: "sofia@example.com" },
    { userId: "seed_user_4", name: "Liam Chen", email: "liam@example.com" },
    { userId: "seed_user_5", name: "Maya Patel", email: "maya@example.com" },
  ];

  const statuses = ["pending", "scheduled", "cancelled", "completed"] as const;
  const reasons = [
    "Annual checkup",
    "Follow-up visit",
    "Persistent headache",
    "Skin rash evaluation",
    "Blood pressure review",
  ];

  for (let i = 0; i < 24; i++) {
    const patient = samplePatients[i % samplePatients.length];
    const doctor = doctors[i % doctors.length];
    const day = addDays(new Date(), (i % 14) - 3);
    const schedule = setMinutes(
      setHours(day, 9 + (i % 7)),
      i % 2 === 0 ? 0 : 30
    );

    const record: AppointmentRecord = {
      $id: `seed_appt_${i + 1}`,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      userId: patient.userId,
      patientId: `seed_patient_${(i % samplePatients.length) + 1}`,
      patientName: patient.name,
      patientEmail: patient.email,
      primaryPhysician: doctor.name,
      doctorId: doctor.$id,
      reason: reasons[i % reasons.length],
      note: i % 3 === 0 ? "Patient prefers morning slots" : undefined,
      schedule: schedule.toISOString(),
      status: statuses[i % statuses.length],
      cancellationReason:
        statuses[i % statuses.length] === "cancelled"
          ? "Patient schedule conflict"
          : null,
      durationMinutes: doctor.slotMinutes,
      location: doctor.roomNumber,
      tags: i % 4 === 0 ? ["vip"] : [],
    };

    await mirrorAppointment(record);

    if (i % 5 === 0) {
      await addAppointmentComment({
        appointmentId: record.$id,
        authorId: "admin",
        authorName: "Clinic Admin",
        authorRole: "admin",
        body: "Seed note: confirm insurance card on arrival.",
        isInternal: true,
      });
    }

    await recordActivity({
      entityType: "appointment",
      entityId: record.$id,
      actorId: "system",
      actorName: "Seed Script",
      verb: "seeded",
      message: `Seeded appointment for ${patient.name}`,
    });
  }

  await enqueueJob({
    type: "daily_digest",
    payload: { recipients: ["admin"] },
  });
  await enqueueJob({
    type: "analytics_rollup",
    payload: { rangeDays: 30 },
  });

  await submitApprovalRequest({
    resourceType: "export",
    resourceId: "monthly_report",
    title: "Export monthly PHI-safe appointment report",
    rationale: "Operations needs an Excel export for board review.",
    requestedBy: "receptionist_1",
    requestedByName: "Front Desk",
    requestedByRole: "receptionist",
    priority: "normal",
  });

  await writeAuditLog({
    actorId: "system",
    actorRole: "system",
    action: "create",
    resourceType: "seed",
    resourceId: "platform",
    summary: "Platform seed completed",
  });

  await recordMetric("seed.runs", 1);
  await recordMetric("api.requests", 0);

  logger.info("seed.complete", { doctors: doctors.length });
  return { doctors: doctors.length, appointments: 24 };
}
