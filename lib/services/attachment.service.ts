import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import {
  createDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
} from "@/lib/persistence/document-store";
import { recordActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import { validationError } from "@/lib/errors";
import type { AppointmentAttachment, PaginatedResult } from "@/types/domain";

const UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 8 * 1024 * 1024;

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

export async function saveAppointmentAttachment(input: {
  appointmentId: string;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  description?: string;
  notifyUserId?: string;
  actorName?: string;
}): Promise<AppointmentAttachment> {
  if (!ALLOWED_MIME.has(input.mimeType)) {
    throw validationError(`File type ${input.mimeType} is not allowed`);
  }
  if (input.buffer.byteLength > MAX_BYTES) {
    throw validationError("File exceeds 8MB limit");
  }

  await ensureUploadDir();
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${nanoid()}_${safeName}`;
  const storagePath = path.join(UPLOAD_ROOT, storedName);
  await fs.writeFile(storagePath, input.buffer);

  const attachment = (await createDocument("attachments", {
    appointmentId: input.appointmentId,
    uploadedBy: input.uploadedBy,
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.byteLength,
    storagePath: storedName,
    description: input.description,
  })) as unknown as AppointmentAttachment;

  await recordActivity({
    entityType: "appointment",
    entityId: input.appointmentId,
    actorId: input.uploadedBy,
    actorName: input.actorName ?? input.uploadedBy,
    verb: "uploaded",
    message: `Uploaded attachment ${input.fileName}`,
    metadata: { attachmentId: attachment.$id },
  });

  if (input.notifyUserId) {
    await createNotification({
      userId: input.notifyUserId,
      title: "New appointment attachment",
      body: `${input.fileName} was added to your appointment`,
      type: "attachment_added",
      href: `/admin/appointments/${input.appointmentId}`,
    });
  }

  return attachment;
}

export async function listAppointmentAttachments(
  appointmentId: string
): Promise<PaginatedResult<AppointmentAttachment>> {
  const { documents, total } = await queryDocuments<
    AppointmentAttachment & {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
    }
  >("attachments", (doc) => doc.appointmentId === appointmentId, {
    sort: (a, b) =>
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
  });

  return {
    items: documents,
    total,
    page: 1,
    pageSize: total,
    hasMore: false,
  };
}

export async function readAttachmentFile(
  attachmentId: string
): Promise<{ attachment: AppointmentAttachment; buffer: Buffer }> {
  const attachment = (await getDocument(
    "attachments",
    attachmentId
  )) as unknown as AppointmentAttachment | null;
  if (!attachment) throw validationError("Attachment not found", { attachmentId });
  const fullPath = path.join(UPLOAD_ROOT, attachment.storagePath);
  const buffer = await fs.readFile(fullPath);
  return { attachment, buffer };
}

export async function removeAppointmentAttachment(
  attachmentId: string
): Promise<boolean> {
  const attachment = (await getDocument(
    "attachments",
    attachmentId
  )) as unknown as AppointmentAttachment | null;
  if (!attachment) return false;
  try {
    await fs.unlink(path.join(UPLOAD_ROOT, attachment.storagePath));
  } catch {
    // file may already be gone
  }
  return deleteDocument("attachments", attachmentId);
}
