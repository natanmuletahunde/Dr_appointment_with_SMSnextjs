# Security model

## Threat model (clinic SaaS MVP → production path)

| Asset | Risk | Current control | Next hardening |
|---|---|---|---|
| Admin dashboard | Unauthorized access | Passkey + signed HTTP-only cookie + middleware | SSO / MFA, short-lived tokens |
| Patient records | IDOR via URL userId | Session binding started for portal flows | Enforce ownership checks on every action |
| Exports | PHI leakage | Admin-only export endpoints | Watermarking, access tickets, audit review |
| Uploads | Malware / oversized files | MIME allow-list + 8MB cap | Antivirus scan, signed download URLs |
| API abuse | Flooding | In-memory rate limiter helper | Redis rate limit + WAF |
| Secrets | Env leakage | `.env*` gitignored | Secret manager / rotated keys |

## Authentication

1. **Admin**
   - Client enters passkey
   - Server verifies with timing-safe compare
   - Signed session cookie (`carepulse_session`) is issued
   - Middleware redirects unauthenticated users away from protected `/admin/*` pages

2. **Patient**
   - Onboarding creates/finds Appwrite user
   - Patient session cookie is issued for portal navigation
   - Appointment and profile pages should continue to validate `session.userId === route userId`

## Authorization

Permissions are centralized in `lib/auth/rbac.ts`.

Examples:
- Patients can read/write own appointments and comments
- Receptionists can schedule and export, but cannot change clinic settings
- Admins have full operational access including audit and jobs

Use `hasPermission(role, permission)` before mutating sensitive resources.

## Data stores

- **Appwrite**: canonical patients + appointments + storage + messaging
- **Local `.data` store**: notifications, audit, jobs, doctors, settings, comments, attachments metadata, waitlist, messages, reports

For multi-node production, replace the local store with Appwrite collections or a managed database using the same repository interfaces.

## Logging & audit

- Structured JSON logs via `lib/logger.ts`
- Immutable-style audit entries via `writeAuditLog`
- Activity timeline entries for appointment-centric UX

Never log raw passkeys, API keys, or full identification documents.
