# CarePulse Architecture

CarePulse is a Next.js App Router clinic appointment platform. It combines an Appwrite-backed core (patients, appointments, SMS) with a local document store and service layer for extended operational features.

## High-level layers

```
┌─────────────────────────────────────────────────────────┐
│  UI (app/, components/)                                  │
│  Patient portal · Admin dashboard · Forms · Tables       │
├─────────────────────────────────────────────────────────┤
│  REST API v1 (app/api/v1/*) + Cron (app/api/cron/*)      │
│  Session cookies · requireAdmin · toErrorResponse        │
├─────────────────────────────────────────────────────────┤
│  Server actions (lib/actions/*)                          │
│  createAppointment · patient/auth flows                  │
├─────────────────────────────────────────────────────────┤
│  Domain services (lib/services/*)                        │
│  Doctors · Analytics · Notifications · Jobs · Export …   │
├─────────────────────────────────────────────────────────┤
│  Persistence                                             │
│  Appwrite (node-appwrite)  │  Local .data JSON store     │
└─────────────────────────────────────────────────────────┘
```

## Request flow

1. Browser or API client hits a page or `/api/v1/...` route.
2. Routes use `lib/api/http.ts` helpers (`jsonOk`, `jsonError`, `requireAdmin`).
3. Admin-only endpoints call `getSession()` and enforce `role === "admin"`.
4. Services read/write either Appwrite collections or the `.data/` document store.
5. Appointment creates/updates emit domain events (`lib/events`) which can enqueue reminders and notifications.

## Auth & RBAC

- Signed HTTP-only cookie `carepulse_session` (`lib/auth/session.ts`).
- Roles: `patient`, `receptionist`, `nurse`, `doctor`, `admin`.
- Permissions live in `lib/auth/rbac.ts` and are covered by unit tests.

## Caching

In-process LRU-style cache (`lib/cache/memory-cache.ts`) warms doctor lists, clinic settings, and analytics snapshots. Suitable for single-node deployments; swap to Redis for multi-instance.

## Background work

Jobs are stored in the local `jobs` collection. `POST /api/v1/jobs/process` (admin) and `/api/cron/reminders` run `processDueJobs` for due reminder/digest work.

## Versioning

Public REST surface is under `/api/v1`. Breaking changes should introduce `/api/v2` rather than mutating v1 contracts.

See also: [API.md](./API.md), [DATABASE.md](./DATABASE.md), [MODULES.md](./MODULES.md).
