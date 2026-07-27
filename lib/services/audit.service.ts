import { createDocument, queryDocuments } from "@/lib/persistence/document-store";
import type {
  AuditAction,
  AuditLogEntry,
  PaginatedResult,
  UserRole,
} from "@/types/domain";
import { logger } from "@/lib/logger";

export async function writeAuditLog(input: {
  actorId: string;
  actorRole: UserRole | "system";
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  summary: string;
  ip?: string;
  userAgent?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}): Promise<AuditLogEntry> {
  const entry = (await createDocument("audit_logs", {
    ...input,
    before: input.before ?? null,
    after: input.after ?? null,
  })) as unknown as AuditLogEntry;

  logger.info("audit.write", {
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    actorId: input.actorId,
  });

  return entry;
}

export async function listAuditLogs(options?: {
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: AuditAction;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<AuditLogEntry>> {
  const page = options?.page ?? 1;
  const pageSize = Math.min(options?.pageSize ?? 25, 100);
  const offset = (page - 1) * pageSize;

  const { documents, total } = await queryDocuments<
    AuditLogEntry & { $id: string; $createdAt: string; $updatedAt: string }
  >(
    "audit_logs",
    (doc) => {
      if (options?.actorId && doc.actorId !== options.actorId) return false;
      if (options?.resourceType && doc.resourceType !== options.resourceType)
        return false;
      if (options?.resourceId && doc.resourceId !== options.resourceId)
        return false;
      if (options?.action && doc.action !== options.action) return false;
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
