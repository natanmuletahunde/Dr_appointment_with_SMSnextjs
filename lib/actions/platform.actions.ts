"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import {
  listAllMirroredAppointments,
  searchAppointments,
} from "@/lib/services/appointment-catalog.service";
import { addAppointmentComment } from "@/lib/services/comment.service";
import { listDoctors } from "@/lib/services/doctor.service";
import {
  exportAppointmentsToCsv,
  exportAppointmentsToExcel,
  exportAppointmentsToPdf,
} from "@/lib/services/export.service";
import { processDueJobs } from "@/lib/services/job.service";
import {
  markMessageRead,
  sendMessage,
} from "@/lib/services/message.service";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notification.service";
import {
  generateAndSaveReport,
  type ReportType,
} from "@/lib/services/report.service";
import { updateClinicSettings } from "@/lib/services/settings.service";
import {
  joinWaitlist,
  offerWaitlistSlot,
} from "@/lib/services/waitlist.service";
import type { ClinicSettings, SearchFilters, UserRole } from "@/types/domain";

export async function markNotificationReadAction(
  notificationId: string,
  userId: string
) {
  const updated = await markNotificationRead(notificationId, userId);
  revalidatePath(`/admin/notifications`);
  revalidatePath(`/patients/${userId}/notifications`);
  return updated;
}

export async function markAllReadAction(userId: string) {
  const count = await markAllNotificationsRead(userId);
  revalidatePath(`/admin/notifications`);
  revalidatePath(`/patients/${userId}/notifications`);
  return { count };
}

export async function addCommentAction(input: {
  appointmentId: string;
  body: string;
  isInternal?: boolean;
  notifyUserId?: string;
}) {
  const session = await getSession();
  const authorId = session?.userId ?? "admin";
  const authorName = session?.name ?? "Admin";
  const authorRole = (session?.role ?? "admin") as UserRole;

  const comment = await addAppointmentComment({
    appointmentId: input.appointmentId,
    authorId,
    authorName,
    authorRole,
    body: input.body,
    isInternal: input.isInternal,
    notifyUserId: input.notifyUserId,
  });

  revalidatePath(`/admin/appointments/${input.appointmentId}`);
  return comment;
}

export async function updateSettingsAction(
  patch: Partial<ClinicSettings>
): Promise<ClinicSettings> {
  const updated = await updateClinicSettings(patch);
  revalidatePath("/admin/settings");
  return updated;
}

export async function processJobsAction(limit = 10) {
  const results = await processDueJobs(limit);
  revalidatePath("/admin/jobs");
  return results;
}

export async function exportAppointmentsAction(
  format: "csv" | "xlsx" | "pdf" = "csv"
) {
  const appointments = await listAllMirroredAppointments();
  if (format === "csv") {
    return {
      format,
      encoding: "utf8" as const,
      data: exportAppointmentsToCsv(appointments),
    };
  }
  const buffer =
    format === "xlsx"
      ? exportAppointmentsToExcel(appointments)
      : exportAppointmentsToPdf(appointments);
  return {
    format,
    encoding: "base64" as const,
    data: buffer.toString("base64"),
  };
}

export async function searchAppointmentsAction(filters: SearchFilters) {
  return searchAppointments(filters);
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const fromUserId = String(formData.get("fromUserId") || "").trim();
  const toUserId = String(formData.get("toUserId") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const threadId = String(formData.get("threadId") || "").trim() || undefined;

  if (!fromUserId || !toUserId || !subject || !body) return;

  await sendMessage({ fromUserId, toUserId, subject, body, threadId });

  revalidatePath("/admin/messages");
  revalidatePath(`/patients/${fromUserId}/messages`);
  revalidatePath(`/patients/${toUserId}/messages`);
}

export async function markMessageReadAction(
  messageId: string,
  userId: string
): Promise<void> {
  await markMessageRead(messageId, userId);
  revalidatePath("/admin/messages");
  revalidatePath(`/patients/${userId}/messages`);
}

export async function joinWaitlistAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") || "").trim();
  const patientName = String(formData.get("patientName") || "").trim();
  const preferredDoctor = String(formData.get("preferredDoctor") || "").trim();
  const earliestDate = String(formData.get("earliestDate") || "").trim();
  const latestDate = String(formData.get("latestDate") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const patientEmail = String(formData.get("patientEmail") || "").trim();
  const patientPhone = String(formData.get("patientPhone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const preferredDaysRaw = String(formData.get("preferredDays") || "");
  const preferredDays = preferredDaysRaw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n));

  if (
    !userId ||
    !patientName ||
    !preferredDoctor ||
    !earliestDate ||
    !latestDate ||
    !reason
  ) {
    return;
  }

  await joinWaitlist({
    userId,
    patientName,
    preferredDoctor,
    earliestDate,
    latestDate,
    reason,
    preferredDays,
    patientEmail: patientEmail || undefined,
    patientPhone: patientPhone || undefined,
    notes: notes || undefined,
  });

  revalidatePath("/admin/waitlist");
  revalidatePath(`/patients/${userId}/waitlist`);
}

export async function offerWaitlistAction(formData: FormData): Promise<void> {
  const session = await getSession();
  const entryId = String(formData.get("entryId") || "").trim();
  const offeredSlot = String(formData.get("offeredSlot") || "").trim();
  if (!entryId || !offeredSlot) return;

  const slotIso = offeredSlot.includes("Z")
    ? offeredSlot
    : new Date(offeredSlot).toISOString();

  const updated = await offerWaitlistSlot({
    entryId,
    offeredSlot: slotIso,
    actorId: session?.userId ?? "admin",
  });

  revalidatePath("/admin/waitlist");
  revalidatePath(`/patients/${updated.userId}/waitlist`);
}

export async function generateReportAction(formData: FormData): Promise<void> {
  const type = String(formData.get("type") || "") as ReportType;
  if (
    type !== "daily_ops" &&
    type !== "doctor_utilization" &&
    type !== "cancellation"
  ) {
    return;
  }

  const session = await getSession();
  const [appointments, doctors] = await Promise.all([
    listAllMirroredAppointments(),
    listDoctors(),
  ]);

  await generateAndSaveReport(
    type,
    appointments,
    doctors,
    session?.userId ?? "admin"
  );

  revalidatePath("/admin/reports");
}
