import { onEvent } from "@/lib/events/bus";
import { createNotification, sendEmailNotification } from "@/lib/services/notification.service";
import { writeAuditLog } from "@/lib/services/audit.service";
import { recordActivity } from "@/lib/services/activity.service";
import { scheduleAppointmentReminder } from "@/lib/services/job.service";
import { getClinicSettings } from "@/lib/services/settings.service";
import { logger } from "@/lib/logger";

let registered = false;

/** Wire domain events once per process. */
export function registerDomainEventHandlers() {
  if (registered) return;
  registered = true;

  onEvent("appointment.created", async (payload) => {
    await createNotification({
      userId: payload.userId,
      title: "Appointment requested",
      body: `Your appointment request with Dr. ${payload.doctor} was received.`,
      type: "appointment_created",
      href: `/patients/${payload.userId}/appointments`,
    });

    await recordActivity({
      entityType: "appointment",
      entityId: payload.appointmentId,
      actorId: payload.userId,
      actorName: "Patient",
      verb: "created",
      message: `Appointment requested with Dr. ${payload.doctor}`,
      metadata: { schedule: payload.schedule },
    });

    await writeAuditLog({
      actorId: payload.userId,
      actorRole: "patient",
      action: "create",
      resourceType: "appointment",
      resourceId: payload.appointmentId,
      summary: "Patient created appointment request",
      after: payload as unknown as Record<string, unknown>,
    });

    const settings = await getClinicSettings();
    await scheduleAppointmentReminder({
      userId: payload.userId,
      scheduleIso: payload.schedule,
      doctor: payload.doctor,
      hoursBefore: settings.reminderHoursBefore,
    });

    logger.info("handler.appointment.created", payload);
  });

  onEvent("appointment.updated", async (payload) => {
    const title =
      payload.type === "schedule"
        ? "Appointment scheduled"
        : payload.type === "cancel"
          ? "Appointment cancelled"
          : "Appointment updated";

    await createNotification({
      userId: payload.userId,
      title,
      body: `Status is now ${payload.status}.`,
      type:
        payload.type === "cancel"
          ? "appointment_cancelled"
          : payload.type === "schedule"
            ? "appointment_scheduled"
            : "system",
      href: `/patients/${payload.userId}/appointments`,
    });

    await recordActivity({
      entityType: "appointment",
      entityId: payload.appointmentId,
      actorId: "admin",
      actorName: "Clinic Admin",
      verb: payload.type,
      message: title,
      metadata: { status: payload.status },
    });

    await writeAuditLog({
      actorId: "admin",
      actorRole: "admin",
      action:
        payload.type === "cancel"
          ? "cancel"
          : payload.type === "schedule"
            ? "schedule"
            : "update",
      resourceType: "appointment",
      resourceId: payload.appointmentId,
      summary: title,
      after: payload as unknown as Record<string, unknown>,
    });
  });

  onEvent("patient.registered", async (payload) => {
    await createNotification({
      userId: payload.userId,
      title: "Welcome to CarePulse",
      body: `Hi ${payload.name}, your patient profile is ready.`,
      type: "system",
      href: `/patients/${payload.userId}/dashboard`,
    });

    await sendEmailNotification({
      to: `${payload.userId}@carepulse.local`,
      subject: "Welcome to CarePulse",
      body: `Welcome ${payload.name}. Your registration is complete.`,
      userId: payload.userId,
    });

    await writeAuditLog({
      actorId: payload.userId,
      actorRole: "patient",
      action: "create",
      resourceType: "patient",
      resourceId: payload.patientId,
      summary: "Patient registered",
    });
  });

  logger.info("domain.event.handlers.registered");
}
