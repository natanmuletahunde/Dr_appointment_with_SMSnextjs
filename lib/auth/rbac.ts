import type { Permission, RoleDefinition, UserRole } from "@/types/domain";

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: "patient",
    description: "Book and manage personal appointments",
    permissions: [
      "appointments:read",
      "appointments:write",
      "appointments:cancel",
      "patients:read",
      "patients:write",
      "doctors:read",
      "notifications:read",
      "comments:read",
      "comments:write",
      "attachments:read",
      "attachments:write",
    ],
  },
  {
    role: "receptionist",
    description: "Front-desk scheduling and patient intake",
    permissions: [
      "appointments:read",
      "appointments:write",
      "appointments:schedule",
      "appointments:cancel",
      "patients:read",
      "patients:write",
      "doctors:read",
      "notifications:read",
      "notifications:write",
      "comments:read",
      "comments:write",
      "attachments:read",
      "attachments:write",
      "exports:run",
    ],
  },
  {
    role: "nurse",
    description: "Clinical support and appointment notes",
    permissions: [
      "appointments:read",
      "appointments:write",
      "patients:read",
      "doctors:read",
      "notifications:read",
      "comments:read",
      "comments:write",
      "attachments:read",
      "attachments:write",
    ],
  },
  {
    role: "doctor",
    description: "Manage own schedule and patient visits",
    permissions: [
      "appointments:read",
      "appointments:write",
      "appointments:schedule",
      "appointments:cancel",
      "patients:read",
      "doctors:read",
      "doctors:write",
      "notifications:read",
      "comments:read",
      "comments:write",
      "attachments:read",
      "attachments:write",
      "analytics:read",
    ],
  },
  {
    role: "admin",
    description: "Full clinic operations and configuration",
    permissions: [
      "appointments:read",
      "appointments:write",
      "appointments:schedule",
      "appointments:cancel",
      "patients:read",
      "patients:write",
      "doctors:read",
      "doctors:write",
      "analytics:read",
      "audit:read",
      "notifications:read",
      "notifications:write",
      "settings:read",
      "settings:write",
      "comments:read",
      "comments:write",
      "attachments:read",
      "attachments:write",
      "exports:run",
      "jobs:manage",
    ],
  },
];

const permissionIndex = new Map<UserRole, Set<Permission>>(
  ROLE_DEFINITIONS.map((def) => [def.role, new Set(def.permissions)])
);

export function getPermissionsForRole(role: UserRole): Permission[] {
  return [...(permissionIndex.get(role) ?? [])];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissionIndex.get(role)?.has(permission) ?? false;
}

export function assertPermission(
  role: UserRole,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role "${role}" lacks permission "${permission}"`);
  }
}

export function canAccessAdminArea(role: UserRole): boolean {
  return (
    role === "admin" ||
    role === "receptionist" ||
    role === "doctor" ||
    role === "nurse"
  );
}
