import {
  createDocument,
  getDocument,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { writeAuditLog } from "@/lib/services/audit.service";
import { recordActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import { conflict, notFound, validationError } from "@/lib/errors";
import type { BaseEntity, UserRole } from "@/types/domain";

export type ApprovalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface ApprovalRequest extends BaseEntity {
  resourceType: "appointment" | "schedule_change" | "export" | "doctor_leave";
  resourceId: string;
  title: string;
  rationale: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: UserRole;
  status: ApprovalStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNote?: string;
  reviewedAt?: string;
  priority: "low" | "normal" | "high";
}

export async function submitApprovalRequest(input: {
  resourceType: ApprovalRequest["resourceType"];
  resourceId: string;
  title: string;
  rationale: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: UserRole;
  priority?: ApprovalRequest["priority"];
}): Promise<ApprovalRequest> {
  if (!input.rationale.trim()) {
    throw validationError("Approval rationale is required");
  }

  const request = (await createDocument("approvals", {
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    title: input.title,
    rationale: input.rationale,
    requestedBy: input.requestedBy,
    requestedByName: input.requestedByName,
    requestedByRole: input.requestedByRole,
    status: "submitted" as ApprovalStatus,
    priority: input.priority ?? "normal",
  })) as unknown as ApprovalRequest;

  await recordActivity({
    entityType: input.resourceType,
    entityId: input.resourceId,
    actorId: input.requestedBy,
    actorName: input.requestedByName,
    verb: "submitted_for_approval",
    message: input.title,
  });

  await createNotification({
    userId: "admin",
    title: "Approval requested",
    body: input.title,
    type: "system",
    href: "/admin/approvals",
  });

  await writeAuditLog({
    actorId: input.requestedBy,
    actorRole: input.requestedByRole,
    action: "create",
    resourceType: "approval",
    resourceId: request.$id,
    summary: `Submitted approval: ${input.title}`,
  });

  return request;
}

export async function listApprovalRequests(options?: {
  status?: ApprovalStatus;
}): Promise<ApprovalRequest[]> {
  const { documents } = await queryDocuments<ApprovalRequest>(
    "approvals",
    (doc) => (options?.status ? doc.status === options.status : true),
    {
      sort: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    }
  );
  return documents;
}

export async function reviewApprovalRequest(input: {
  requestId: string;
  decision: "approved" | "rejected";
  reviewerId: string;
  reviewerName: string;
  reviewNote?: string;
}): Promise<ApprovalRequest> {
  const existing = (await getDocument(
    "approvals",
    input.requestId
  )) as unknown as ApprovalRequest | null;

  if (!existing) throw notFound("Approval request not found");
  if (existing.status !== "submitted") {
    throw conflict(`Request is already ${existing.status}`);
  }

  const updated = (await updateDocument("approvals", input.requestId, {
    status: input.decision,
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName,
    reviewNote: input.reviewNote,
    reviewedAt: new Date().toISOString(),
  })) as unknown as ApprovalRequest;

  await createNotification({
    userId: existing.requestedBy,
    title: `Approval ${input.decision}`,
    body: existing.title,
    type: "system",
    href: `/admin/approvals`,
  });

  await writeAuditLog({
    actorId: input.reviewerId,
    actorRole: "admin",
    action: input.decision === "approved" ? "approve" : "reject",
    resourceType: "approval",
    resourceId: input.requestId,
    summary: `${input.decision} approval request`,
    after: { decision: input.decision, note: input.reviewNote },
  });

  return updated;
}
