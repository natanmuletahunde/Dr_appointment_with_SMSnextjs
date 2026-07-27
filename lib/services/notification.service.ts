import {
  createDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import type {
  NotificationChannel,
  NotificationItem,
  NotificationType,
  PaginatedResult,
} from "@/types/domain";
import { logger } from "@/lib/logger";
import { cacheInvalidate } from "@/lib/cache/memory-cache";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  channel?: NotificationChannel;
  href?: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationItem> {
  const item = (await createDocument("notifications", {
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    channel: input.channel ?? "in_app",
    read: false,
    href: input.href,
    metadata: input.metadata ?? {},
  })) as unknown as NotificationItem;

  cacheInvalidate(`notifications:${input.userId}`);
  logger.info("notification.created", {
    userId: input.userId,
    type: input.type,
  });
  return item;
}

export async function listNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; page?: number; pageSize?: number }
): Promise<PaginatedResult<NotificationItem>> {
  const page = options?.page ?? 1;
  const pageSize = Math.min(options?.pageSize ?? 20, 100);
  const offset = (page - 1) * pageSize;

  const { documents, total } = await queryDocuments<
    NotificationItem & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "notifications",
    (doc) => {
      if (doc.userId !== userId) return false;
      if (options?.unreadOnly && doc.read) return false;
      return true;
    },
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
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

export async function markNotificationRead(
  id: string,
  userId: string
): Promise<NotificationItem | null> {
  const { documents } = await queryDocuments<
    NotificationItem & { $id: string; $createdAt: string; $updatedAt: string }
  >("notifications", (doc) => doc.$id === id && doc.userId === userId);

  if (!documents[0]) return null;
  const updated = (await updateDocument("notifications", id, {
    read: true,
  })) as unknown as NotificationItem;
  cacheInvalidate(`notifications:${userId}`);
  return updated;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const { documents } = await queryDocuments<
    NotificationItem & { $id: string; $createdAt: string; $updatedAt: string }
  >("notifications", (doc) => doc.userId === userId && !doc.read);

  for (const doc of documents) {
    await updateDocument("notifications", doc.$id, { read: true });
  }
  cacheInvalidate(`notifications:${userId}`);
  return documents.length;
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  const { total } = await queryDocuments<{
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    read: boolean;
  }>("notifications", (doc) => doc.userId === userId && doc.read === false);
  return total;
}

/** Lightweight email channel stub — logs intent; integrate SMTP/provider in production. */
export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  body: string;
  userId: string;
}): Promise<void> {
  await createNotification({
    userId: input.userId,
    title: input.subject,
    body: input.body,
    type: "system",
    channel: "email",
    metadata: { to: input.to },
  });
  logger.info("email.queued", { to: input.to, subject: input.subject });
}
