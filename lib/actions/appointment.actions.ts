"use server";
import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
import { emitEvent } from "@/lib/events/bus";
import { registerDomainEventHandlers } from "@/lib/events/handlers";
import { mirrorAppointment } from "@/lib/services/appointment-catalog.service";
import { detectScheduleConflict, getDoctorByName } from "@/lib/services/doctor.service";
import { getClinicSettings } from "@/lib/services/settings.service";
import { logger } from "@/lib/logger";
import type { AppointmentRecord } from "@/types/domain";

registerDomainEventHandlers();

function toMirror(doc: Appointment & { $id: string; $createdAt: string; $updatedAt: string }): AppointmentRecord {
  const patient = doc.patient as unknown as {
    $id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    patientId: typeof doc.patient === "string" ? doc.patient : patient?.$id ?? "",
    patientName: patient?.name ?? "Patient",
    patientEmail: patient?.email,
    patientPhone: patient?.phone,
    primaryPhysician: doc.primaryPhysician,
    reason: doc.reason,
    note: doc.note,
    schedule: new Date(doc.schedule).toISOString(),
    status: doc.status as AppointmentRecord["status"],
    cancellationReason: doc.cancellationReason,
    durationMinutes: 30,
  };
}

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const settings = await getClinicSettings();
    if (!settings.allowOnlineBooking) {
      throw new Error("Online booking is currently disabled");
    }

    const existing = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("primaryPhysician", [appointment.primaryPhysician]),
        Query.notEqual("status", ["cancelled"]),
        Query.limit(100),
      ]
    );

    const conflict = await detectScheduleConflict({
      doctorName: appointment.primaryPhysician,
      scheduleIso: new Date(appointment.schedule).toISOString(),
      existingSchedules: existing.documents.map((d) => ({
        id: d.$id,
        schedule: new Date(d.schedule as string).toISOString(),
        status: String(d.status),
      })),
    });

    if (conflict.conflict) {
      throw new Error(conflict.message);
    }

    const doctor = await getDoctorByName(appointment.primaryPhysician);

    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    const mirrored = await mirrorAppointment({
      $id: newAppointment.$id,
      $createdAt: newAppointment.$createdAt,
      $updatedAt: newAppointment.$updatedAt,
      userId: appointment.userId,
      patientId: appointment.patient,
      patientName: "Patient",
      primaryPhysician: appointment.primaryPhysician,
      doctorId: doctor?.$id,
      reason: appointment.reason,
      note: appointment.note,
      schedule: new Date(appointment.schedule).toISOString(),
      status: appointment.status as AppointmentRecord["status"],
      durationMinutes: doctor?.slotMinutes ?? settings.appointmentSlotMinutes,
    });

    await emitEvent("appointment.created", {
      appointmentId: mirrored.$id,
      userId: appointment.userId,
      doctor: appointment.primaryPhysician,
      schedule: mirrored.schedule,
    });

    return parseStringify(newAppointment);
  } catch (error) {
    logger.error("appointment.create.failed", { error: String(error) });
    throw error;
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );
    return parseStringify(appointment);
  } catch (error) {
    logger.error("appointment.get.failed", { appointmentId, error: String(error) });
  }
};

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
    };

    const docs = appointments.documents as unknown as Appointment[];

    const counts = docs.reduce((acc, appointment) => {
      if (appointment.status === "scheduled") acc.scheduledCount += 1;
      else if (appointment.status === "pending") acc.pendingCount += 1;
      else if (appointment.status === "cancelled") acc.cancelledCount += 1;
      else if ((appointment.status as string) === "completed")
        acc.completedCount += 1;
      return acc;
    }, initialCounts);

    // Keep local search catalog warm
    for (const doc of appointments.documents) {
      try {
        await mirrorAppointment(
          toMirror(
            doc as unknown as Appointment & {
              $id: string;
              $createdAt: string;
              $updatedAt: string;
            }
          )
        );
      } catch {
        // non-blocking
      }
    }

    return parseStringify({
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    });
  } catch (error) {
    logger.error("appointment.list.failed", { error: String(error) });
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
      documents: [],
    };
  }
};

export const getAppointmentsByUser = async (userId: string) => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal("userId", [userId]), Query.orderDesc("schedule")]
    );
    return parseStringify(appointments.documents);
  } catch (error) {
    logger.error("appointment.byUser.failed", { userId, error: String(error) });
    return [];
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    if (type === "schedule" && appointment.schedule && appointment.primaryPhysician) {
      const existing = await databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [
          Query.equal("primaryPhysician", [appointment.primaryPhysician]),
          Query.notEqual("status", ["cancelled"]),
          Query.limit(100),
        ]
      );

      const conflict = await detectScheduleConflict({
        doctorName: appointment.primaryPhysician,
        scheduleIso: new Date(appointment.schedule).toISOString(),
        excludeAppointmentId: appointmentId,
        existingSchedules: existing.documents.map((d) => ({
          id: d.$id,
          schedule: new Date(d.schedule as string).toISOString(),
          status: String(d.status),
        })),
      });

      if (conflict.conflict) throw new Error(conflict.message);
    }

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw Error;

    await mirrorAppointment(
      toMirror(
        updatedAppointment as unknown as Appointment & {
          $id: string;
          $createdAt: string;
          $updatedAt: string;
        }
      )
    );

    const smsMessage = `Hi it's CarePulse.
    ${
      type === "schedule"
        ? `Your appointment has been scheduled for ${formatDateTime(
            appointment.schedule!,
            timeZone
          ).dateTime} with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform you that your appointment has been cancelled. Reason: ${appointment.cancellationReason}`
    }`;

    await sendSMSNotification(userId, smsMessage);

    await emitEvent("appointment.updated", {
      appointmentId,
      userId,
      status: String(appointment.status ?? updatedAppointment.status),
      type,
    });

    revalidatePath("/admin");
    revalidatePath(`/patients/${userId}/appointments`);
    return parseStringify(updatedAppointment);
  } catch (error) {
    logger.error("appointment.update.failed", { appointmentId, error: String(error) });
    throw error;
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSMS(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    logger.error("sms.send.failed", { userId, error: String(error) });
    return null;
  }
};
