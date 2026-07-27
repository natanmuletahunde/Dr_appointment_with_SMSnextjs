import { describe, expect, it } from "vitest";
import {
  listApprovalRequests,
  reviewApprovalRequest,
  submitApprovalRequest,
} from "@/lib/services/approval.service";

describe("approval workflow", () => {
  it("submits and reviews a request", async () => {
    const created = await submitApprovalRequest({
      resourceType: "export",
      resourceId: `export_${Date.now()}`,
      title: "Test export approval",
      rationale: "Needed for QA verification of workflow",
      requestedBy: "user_qa",
      requestedByName: "QA User",
      requestedByRole: "receptionist",
    });

    expect(created.status).toBe("submitted");

    const approved = await reviewApprovalRequest({
      requestId: created.$id,
      decision: "approved",
      reviewerId: "admin",
      reviewerName: "Admin",
      reviewNote: "Looks good",
    });

    expect(approved.status).toBe("approved");

    const listed = await listApprovalRequests({ status: "approved" });
    expect(listed.some((item) => item.$id === created.$id)).toBe(true);
  });
});
