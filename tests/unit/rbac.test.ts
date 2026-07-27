import { describe, expect, it } from "vitest";
import {
  getPermissionsForRole,
  hasPermission,
  canAccessAdminArea,
} from "@/lib/auth/rbac";

describe("rbac", () => {
  it("grants admin full operational permissions", () => {
    const perms = getPermissionsForRole("admin");
    expect(perms).toContain("analytics:read");
    expect(perms).toContain("audit:read");
    expect(perms).toContain("settings:write");
    expect(perms).toContain("jobs:manage");
    expect(perms).toContain("exports:run");
    expect(hasPermission("admin", "doctors:write")).toBe(true);
  });

  it("limits patient to personal appointment and profile scopes", () => {
    expect(hasPermission("patient", "appointments:read")).toBe(true);
    expect(hasPermission("patient", "appointments:write")).toBe(true);
    expect(hasPermission("patient", "doctors:read")).toBe(true);
    expect(hasPermission("patient", "analytics:read")).toBe(false);
    expect(hasPermission("patient", "audit:read")).toBe(false);
    expect(hasPermission("patient", "settings:write")).toBe(false);
    expect(hasPermission("patient", "jobs:manage")).toBe(false);
    expect(canAccessAdminArea("patient")).toBe(false);
    expect(canAccessAdminArea("admin")).toBe(true);
  });
});
