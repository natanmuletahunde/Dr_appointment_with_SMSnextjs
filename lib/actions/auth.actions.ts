"use server";

import {
  createAdminSession,
  destroySession,
  getSession,
  verifyAdminPasskey,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/services/audit.service";
import { registerDomainEventHandlers } from "@/lib/events/handlers";

registerDomainEventHandlers();

export async function loginAdminWithPasskey(passkey: string) {
  if (!verifyAdminPasskey(passkey)) {
    return { ok: false as const, error: "Invalid admin passkey" };
  }

  const session = await createAdminSession();
  await writeAuditLog({
    actorId: session.userId,
    actorRole: "admin",
    action: "login",
    resourceType: "session",
    resourceId: session.sessionId,
    summary: "Admin logged in with passkey",
  });

  return { ok: true as const, session };
}

export async function logoutCurrentSession() {
  const session = await getSession();
  await destroySession();
  if (session) {
    await writeAuditLog({
      actorId: session.userId,
      actorRole: session.role,
      action: "logout",
      resourceType: "session",
      resourceId: session.sessionId,
      summary: "User logged out",
    });
  }
  return { ok: true as const };
}

export async function getCurrentSessionAction() {
  return getSession();
}
