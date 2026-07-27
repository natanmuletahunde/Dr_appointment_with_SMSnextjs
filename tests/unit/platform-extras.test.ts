import { describe, expect, it } from "vitest";
import { trackEntityDiff } from "@/lib/services/history.service";
import { rateLimit } from "@/lib/security/rate-limit";
import { hasPermission } from "@/lib/auth/rbac";
import { SearchAppointmentsQuerySchema } from "@/lib/validation/platform";

describe("history tracking", () => {
  it("records only changed fields", async () => {
    const entries = await trackEntityDiff({
      entityType: "appointment",
      entityId: `hist_test_${Date.now()}`,
      before: { status: "pending", note: "a" },
      after: { status: "scheduled", note: "a" },
      changedBy: "admin",
      changedByName: "Admin",
      fields: ["status", "note"],
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].field).toBe("status");
    expect(entries[0].oldValue).toBe("pending");
    expect(entries[0].newValue).toBe("scheduled");
  });
});

describe("rate limit", () => {
  it("blocks after limit is exceeded", () => {
    const key = `test-${Date.now()}`;
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });
});

describe("platform validation", () => {
  it("parses appointment search query", () => {
    const parsed = SearchAppointmentsQuerySchema.parse({
      page: "2",
      pageSize: "10",
      status: "pending",
    });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(10);
  });
});

describe("rbac coverage", () => {
  it("allows receptionist exports but not settings write", () => {
    expect(hasPermission("receptionist", "exports:run")).toBe(true);
    expect(hasPermission("receptionist", "settings:write")).toBe(false);
  });
});
