# CarePulse / Doctor Appointment Platform

Production-oriented doctor appointment and clinic operations platform built with **Next.js 15**, **Appwrite**, and an extensible local document store for operational features.

This repository also contains an npm workspaces monorepo under `apps/` and `packages/` for shared UI/feature packages.

## What’s included (root CarePulse app)

- Patient onboarding, registration, and appointment booking
- Admin dashboard with scheduling / cancellation workflows
- Patient portal (dashboard, appointments, profile, notifications)
- Doctor directory with availability slots and conflict detection
- Analytics dashboards (Recharts)
- Notification center (in-app + email channel queue)
- Audit logs and activity timelines
- Appointment comments and attachments
- Approval workflow
- Background jobs + cron processor
- Versioned REST API (`/api/v1/*`)
- Export to CSV / Excel / PDF
- RBAC permissions, session cookies, middleware hardening
- i18n dictionaries (en / es / fr)
- Vitest unit + integration tests
- Architecture and API documentation in `/docs`

## Quick start (root app)

```bash
npm install
npm run dev
```

Admin passkey: set `ADMIN_PASSKEY` or `NEXT_PUBLIC_ADMIN_PASSKEY`.

Seed local operational data:

```bash
npm run seed
```

Run tests:

```bash
npm test
npm run typecheck
```

## Monorepo packages

```
apps/
  web/                  # Next.js workspace app
packages/
  ui-components/        # Reusable UI components
  utils/                # Shared utilities
  feature-appointments/ # Appointment feature package
  feature-patients/     # Patient feature package
```

Workspace app commands:

```bash
npm run dev:web
npm run build:web
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Developer setup](docs/DEVELOPER_SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Modules](docs/MODULES.md)
- [Security](docs/SECURITY.md)

## Environment

See `docs/DEVELOPER_SETUP.md` for the full list. Core Appwrite vars:

- `NEXT_PUBLIC_ENDPOINT`
- `PROJECT_ID`
- `API_KEY`
- `DATABASE_ID`
- `PATIENT_COLLECTION_ID`
- `APPOINTMENT_COLLECTION_ID`
- `NEXT_PUBLIC_BUCKET_ID`
- `ADMIN_PASSKEY`

Extended features persist under `.data/` automatically when local store mode is enabled.
