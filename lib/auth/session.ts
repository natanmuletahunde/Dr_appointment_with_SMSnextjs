import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getAdminPasskey } from "@/lib/env";
import type { UserRole } from "@/types/domain";

export const SESSION_COOKIE = "carepulse_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export interface SessionPayload {
  sessionId: string;
  userId: string;
  role: UserRole;
  name: string;
  email?: string;
  issuedAt: number;
  expiresAt: number;
}

function sign(value: string, secret: string): string {
  return createHash("sha256").update(`${value}.${secret}`).digest("hex");
}

function encodeSession(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

function decodeSession(token: string, secret: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminPasskey(candidate: string): boolean {
  const expected = getAdminPasskey();
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession(input?: {
  name?: string;
  email?: string;
}): Promise<SessionPayload> {
  const secret = getAdminPasskey();
  const now = Date.now();
  const payload: SessionPayload = {
    sessionId: randomBytes(16).toString("hex"),
    userId: "admin",
    role: "admin",
    name: input?.name ?? "Clinic Admin",
    email: input?.email,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const token = encodeSession(payload, secret);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return payload;
}

export async function createPatientSession(input: {
  userId: string;
  name: string;
  email?: string;
}): Promise<SessionPayload> {
  const secret = getAdminPasskey();
  const now = Date.now();
  const payload: SessionPayload = {
    sessionId: randomBytes(16).toString("hex"),
    userId: input.userId,
    role: "patient",
    name: input.name,
    email: input.email,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const token = encodeSession(payload, secret);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return payload;
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token, getAdminPasskey());
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function requireSession(
  roles?: UserRole[]
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (roles && !roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
