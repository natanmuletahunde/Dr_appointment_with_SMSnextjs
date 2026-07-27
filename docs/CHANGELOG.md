# CarePulse Changelog

## 2026-07 — Platform operations release

### Added
- HTTP-only admin/patient session cookies with signed payloads
- Role-based access control (`patient`, `receptionist`, `nurse`, `doctor`, `admin`)
- Middleware protection for sensitive admin routes and security headers
- Local document store (`.data/`) for operational entities with per-collection write locks
- Doctor directory seeded from clinic constants with specialties, ratings, and schedules
- Availability slot generation and appointment conflict detection
- Appointment search catalog with filters, sorting, and pagination
- Analytics snapshot engine + Recharts admin analytics page
- Notification center (in-app + email channel queue)
- Audit logging and activity timelines
- Appointment comments and file attachments
- Clinic settings service and admin settings UI
- Background job queue (reminders, digests, rollups) + `/api/cron/reminders`
- Versioned REST API under `/api/v1/*`
- Export appointments to CSV, Excel, and PDF
- Approval workflow for sensitive operational requests
- Field-level history tracking
- Metrics recording and ops counters
- Global search across appointments, doctors, audit, notifications
- Internal messaging (inbox/sent/threads)
- Saved operational reports (daily ops, utilization, cancellations)
- Appointment waitlist with offer-slot workflow
- Patient portal pages: dashboard, appointments, profile, notifications, messages, waitlist
- Admin pages: analytics, appointments, doctors, patients, notifications, audit, jobs, settings, approvals, search, waitlist, messages, reports
- i18n dictionaries for English, Spanish, and French
- Accessibility helpers (live region announcements, focus trap)
- Request timing/observability helpers
- Reschedule and cancellation eligibility rules
- Platform seed script (`npm run seed`)
- Vitest unit + integration suite

### Fixed
- `getPatient` now filters by `userId`
- Temporary passwords are randomly generated instead of a hardcoded shared password
- Appointment updates emit domain events for notifications/audit/timeline consistency

### Security
- Prefer `ADMIN_PASSKEY` over public env for server verification
- Passkey login now creates a server session, not only `localStorage`
- API admin endpoints require session via `requireAdmin()`

## Prior — CarePulse MVP

- Patient intake forms and Appwrite-backed registration
- Appointment create / schedule / cancel with SMS via Appwrite Messaging
- Admin dashboard with StatCards and TanStack table
- Sentry monitoring integration
