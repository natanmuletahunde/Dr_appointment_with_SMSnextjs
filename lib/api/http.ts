import { NextResponse } from "next/server";
import { forbidden, toErrorResponse, unauthorized } from "@/lib/errors";
import { getSession, type SessionPayload } from "@/lib/auth/session";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown, fallbackStatus?: number): NextResponse {
  const { error: body, status } = toErrorResponse(error);
  return NextResponse.json(
    { error: body },
    { status: fallbackStatus ?? status }
  );
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw unauthorized();
  if (session.role !== "admin") throw forbidden("Admin access required");
  return session;
}

export function withRateLimitHeaders(
  response: NextResponse,
  info: { remaining: number; resetAt: number }
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(info.remaining));
  response.headers.set("X-RateLimit-Reset", String(info.resetAt));
  return response;
}
