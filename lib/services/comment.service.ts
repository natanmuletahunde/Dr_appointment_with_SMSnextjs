import {
  createDocument,
  deleteDocument,
  queryDocuments,
} from "@/lib/persistence/document-store";
import { recordActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import { validationError } from "@/lib/errors";
import type { AppointmentComment, PaginatedResult, UserRole } from "@/types/domain";

export async function addAppointmentComment(input: {
  appointmentId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  isInternal?: boolean;
  notifyUserId?: string;
}): Promise<AppointmentComment> {
  const body = input.body.trim();
  if (body.length < 2) throw validationError("Comment is too short");
  if (body.length > 4000) throw validationError("Comment is too long");

  const comment = (await createDocument("comments", {
    appointmentId: input.appointmentId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorRole: input.authorRole,
    body,
    isInternal: Boolean(input.isInternal),
  })) as unknown as AppointmentComment;

  await recordActivity({
    entityType: "appointment",
    entityId: input.appointmentId,
    actorId: input.authorId,
    actorName: input.authorName,
    verb: "commented",
    message: `${input.authorName} added a comment`,
    metadata: { commentId: comment.$id, isInternal: comment.isInternal },
  });

  if (input.notifyUserId && !input.isInternal) {
    await createNotification({
      userId: input.notifyUserId,
      title: "New appointment comment",
      body: `${input.authorName}: ${body.slice(0, 120)}`,
      type: "comment_added",
      href: `/admin/appointments/${input.appointmentId}`,
    });
  }

  return comment;
}

export async function listAppointmentComments(
  appointmentId: string,
  options?: { includeInternal?: boolean; page?: number; pageSize?: number }
): Promise<PaginatedResult<AppointmentComment>> {
  const page = options?.page ?? 1;
  const pageSize = Math.min(options?.pageSize ?? 50, 100);
  const offset = (page - 1) * pageSize;

  const { documents, total } = await queryDocuments<
    AppointmentComment & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "comments",
    (doc) => {
      if (doc.appointmentId !== appointmentId) return false;
      if (!options?.includeInternal && doc.isInternal) return false;
      return true;
    },
    {
      sort: (a, b) =>
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime(),
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

export async function deleteAppointmentComment(
  commentId: string
): Promise<boolean> {
  return deleteDocument("comments", commentId);
}
