import {
  createDocument,
  getDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { createNotification } from "@/lib/services/notification.service";
import { writeAuditLog } from "@/lib/services/audit.service";
import { notFound, validationError } from "@/lib/errors";
import type { BaseEntity } from "@/types/domain";
import { randomUUID } from "crypto";

export interface ClinicMessage extends BaseEntity {
  fromUserId: string;
  toUserId: string;
  subject: string;
  body: string;
  read: boolean;
  threadId: string;
}

export async function sendMessage(input: {
  fromUserId: string;
  toUserId: string;
  subject: string;
  body: string;
  threadId?: string;
}): Promise<ClinicMessage> {
  if (!input.fromUserId.trim()) {
    throw validationError("fromUserId is required");
  }
  if (!input.toUserId.trim()) {
    throw validationError("toUserId is required");
  }
  if (!input.subject.trim()) {
    throw validationError("subject is required");
  }
  if (!input.body.trim()) {
    throw validationError("body is required");
  }

  const threadId = input.threadId?.trim() || randomUUID();

  const message = (await createDocument("messages", {
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    subject: input.subject.trim(),
    body: input.body.trim(),
    read: false,
    threadId,
  })) as unknown as ClinicMessage;

  await createNotification({
    userId: input.toUserId,
    title: `Message: ${message.subject}`,
    body: message.body.slice(0, 140),
    type: "system",
    href:
      input.toUserId === "admin"
        ? "/admin/messages"
        : `/patients/${input.toUserId}/messages`,
    metadata: { messageId: message.$id, threadId },
  });

  await writeAuditLog({
    actorId: input.fromUserId,
    actorRole: input.fromUserId === "admin" ? "admin" : "patient",
    action: "create",
    resourceType: "message",
    resourceId: message.$id,
    summary: `Sent message: ${message.subject}`,
  });

  return message;
}

export async function listInbox(userId: string): Promise<ClinicMessage[]> {
  const { documents } = await queryDocuments<ClinicMessage>(
    "messages",
    (doc) => doc.toUserId === userId,
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    }
  );
  return documents;
}

export async function listSent(userId: string): Promise<ClinicMessage[]> {
  const { documents } = await queryDocuments<ClinicMessage>(
    "messages",
    (doc) => doc.fromUserId === userId,
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    }
  );
  return documents;
}

export async function markMessageRead(
  messageId: string,
  userId: string
): Promise<ClinicMessage | null> {
  const existing = await getDocument<ClinicMessage>("messages", messageId);
  if (!existing) return null;
  if (existing.toUserId !== userId) {
    throw validationError("Only the recipient can mark a message as read");
  }
  if (existing.read) return existing;

  return (await updateDocument("messages", messageId, {
    read: true,
  })) as unknown as ClinicMessage;
}

export async function getThread(threadId: string): Promise<ClinicMessage[]> {
  if (!threadId.trim()) throw validationError("threadId is required");

  const { documents } = await queryDocuments<ClinicMessage>(
    "messages",
    (doc) => doc.threadId === threadId,
    {
      sort: (a, b) =>
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime(),
    }
  );

  if (documents.length === 0) {
    throw notFound("Thread not found");
  }

  return documents;
}
