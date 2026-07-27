import {
  createDocument,
  deleteDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { createNotification } from "@/lib/services/notification.service";
import { writeAuditLog } from "@/lib/services/audit.service";
import { validationError } from "@/lib/errors";
import type { BaseEntity } from "@/types/domain";

export type WaitlistStatus =
  | "waiting"
  | "offered"
  | "booked"
  | "expired"
  | "cancelled";

export interface WaitlistEntry extends BaseEntity {
  userId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  preferredDoctor: string;
  preferredDays: number[];
  earliestDate: string;
  latestDate: string;
  reason: string;
  status: WaitlistStatus;
  notes?: string;
  offeredSlot?: string;
}

export async function joinWaitlist(input: {
  userId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  preferredDoctor: string;
  preferredDays: number[];
  earliestDate: string;
  latestDate: string;
  reason: string;
  notes?: string;
}): Promise<WaitlistEntry> {
  if (!input.preferredDoctor.trim()) {
    throw validationError("Preferred doctor is required");
  }
  if (input.latestDate < input.earliestDate) {
    throw validationError("latestDate must be on or after earliestDate");
  }

  const entry = (await createDocument("waitlist", {
    userId: input.userId,
    patientName: input.patientName,
    patientEmail: input.patientEmail,
    patientPhone: input.patientPhone,
    preferredDoctor: input.preferredDoctor,
    preferredDays: input.preferredDays,
    earliestDate: input.earliestDate,
    latestDate: input.latestDate,
    reason: input.reason,
    notes: input.notes,
    status: "waiting" as WaitlistStatus,
  })) as unknown as WaitlistEntry;

  await createNotification({
    userId: "admin",
    title: "New waitlist request",
    body: `${input.patientName} is waiting for Dr. ${input.preferredDoctor}`,
    type: "system",
    href: "/admin/waitlist",
  });

  await writeAuditLog({
    actorId: input.userId,
    actorRole: "patient",
    action: "create",
    resourceType: "waitlist",
    resourceId: entry.$id,
    summary: "Patient joined waitlist",
  });

  return entry;
}

export async function listWaitlist(options?: {
  status?: WaitlistStatus;
  doctor?: string;
  userId?: string;
}): Promise<WaitlistEntry[]> {
  const { documents } = await queryDocuments<WaitlistEntry>(
    "waitlist",
    (doc) => {
      if (options?.status && doc.status !== options.status) return false;
      if (options?.userId && doc.userId !== options.userId) return false;
      if (
        options?.doctor &&
        doc.preferredDoctor.toLowerCase() !== options.doctor.toLowerCase()
      )
        return false;
      return true;
    },
    {
      sort: (a, b) =>
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime(),
    }
  );

  return documents;
}

export async function offerWaitlistSlot(input: {
  entryId: string;
  offeredSlot: string;
  actorId: string;
}): Promise<WaitlistEntry> {
  const updated = (await updateDocument("waitlist", input.entryId, {
    status: "offered",
    offeredSlot: input.offeredSlot,
  })) as unknown as WaitlistEntry;

  await createNotification({
    userId: updated.userId,
    title: "Waitlist slot available",
    body: `A slot opened on ${input.offeredSlot}. Claim it from your portal.`,
    type: "system",
    href: `/patients/${updated.userId}/appointments`,
  });

  await writeAuditLog({
    actorId: input.actorId,
    actorRole: "admin",
    action: "update",
    resourceType: "waitlist",
    resourceId: input.entryId,
    summary: "Offered waitlist slot",
    after: { offeredSlot: input.offeredSlot },
  });

  return updated;
}

export async function cancelWaitlistEntry(entryId: string): Promise<boolean> {
  return deleteDocument("waitlist", entryId);
}
