import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "carepulse_session";

const PROTECTED_ADMIN_PREFIXES = [
  "/admin/analytics",
  "/admin/audit",
  "/admin/settings",
  "/admin/jobs",
  "/admin/doctors",
  "/admin/patients",
  "/admin/notifications",
  "/admin/appointments",
  "/admin/approvals",
  "/admin/search",
  "/admin/waitlist",
  "/admin/messages",
  "/admin/reports",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const needsAdminSession = PROTECTED_ADMIN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (needsAdminSession && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("admin", "true");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Soft gate for /admin root: allow page but API routes require session
  if (pathname.startsWith("/api/v1/admin") && !hasSession) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin session required" } },
      { status: 401 }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/:path*"],
};
