"use server";

import { seedPlatformData } from "@/lib/services/seed.service";
import {
  listApprovalRequests,
  reviewApprovalRequest,
  submitApprovalRequest,
} from "@/lib/services/approval.service";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function runPlatformSeedAction() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { ok: false as const, error: "Admin session required" };
  }
  const result = await seedPlatformData();
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/analytics");
  return { ok: true as const, result };
}

export async function listApprovalsAction(status?: string) {
  return listApprovalRequests(
    status
      ? { status: status as "submitted" | "approved" | "rejected" }
      : undefined
  );
}

export async function submitApprovalAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await submitApprovalRequest({
    resourceType: String(formData.get("resourceType") || "export") as
      | "appointment"
      | "schedule_change"
      | "export"
      | "doctor_leave",
    resourceId: String(formData.get("resourceId") || "n/a"),
    title: String(formData.get("title") || "Approval request"),
    rationale: String(formData.get("rationale") || ""),
    requestedBy: session.userId,
    requestedByName: session.name,
    requestedByRole: session.role,
    priority: "normal",
  });

  revalidatePath("/admin/approvals");
}

export async function reviewApprovalAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const requestId = String(formData.get("requestId"));
  const decision = String(formData.get("decision")) as "approved" | "rejected";
  const reviewNote = String(formData.get("reviewNote") || "");

  await reviewApprovalRequest({
    requestId,
    decision,
    reviewerId: session.userId,
    reviewerName: session.name,
    reviewNote,
  });

  revalidatePath("/admin/approvals");
}
