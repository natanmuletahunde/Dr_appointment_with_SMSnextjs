import { createDocument, queryDocuments } from "@/lib/persistence/document-store";
import type { ActivityEvent, PaginatedResult } from "@/types/domain";

export async function recordActivity(input: {
  entityType: string;
  entityId: string;
  actorId: string;
  actorName: string;
  verb: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<ActivityEvent> {
  return (await createDocument("activities", {
    ...input,
    metadata: input.metadata ?? {},
  })) as unknown as ActivityEvent;
}

export async function listActivityTimeline(
  entityType: string,
  entityId: string,
  options?: { page?: number; pageSize?: number }
): Promise<PaginatedResult<ActivityEvent>> {
  const page = options?.page ?? 1;
  const pageSize = Math.min(options?.pageSize ?? 30, 100);
  const offset = (page - 1) * pageSize;

  const { documents, total } = await queryDocuments<
    ActivityEvent & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "activities",
    (doc) => doc.entityType === entityType && doc.entityId === entityId,
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

export async function listRecentClinicActivity(
  limit = 20
): Promise<ActivityEvent[]> {
  const { documents } = await queryDocuments<
    ActivityEvent & { $id: string; $createdAt: string; $updatedAt: string }
  >("activities", () => true, {
    sort: (a, b) =>
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    limit,
  });
  return documents;
}
