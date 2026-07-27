# Developer Setup

## Prerequisites

- Node.js 20+
- npm 10+
- (Optional) Appwrite project for patients/appointments/SMS

## Install

```bash
cd dr_appointment_nextjs
npm install
```

## Environment

Copy or create `.env.local`:

```bash
# Appwrite (required for live booking / SMS)
NEXT_PUBLIC_ENDPOINT=https://cloud.appwrite.io/v1
PROJECT_ID=...
API_KEY=...
DATABASE_ID=...
PATIENT_COLLECTION_ID=...
APPOINTMENT_COLLECTION_ID=...
DOCTOR_COLLECTION_ID=...
NEXT_PUBLIC_BUCKET_ID=...

# Admin passkey (also signs session cookies)
NEXT_PUBLIC_ADMIN_PASSKEY=111111
# or ADMIN_PASSKEY=...

# Clinic
CLINIC_NAME=CarePulse Clinic
CLINIC_TIMEZONE=UTC
APPOINTMENT_SLOT_MINUTES=30
REMINDER_HOURS_BEFORE=24
FEATURE_LOCAL_STORE=true

# Optional cron protection
CRON_SECRET=change-me

# Optional
APP_BASE_URL=http://localhost:3000
```

Without Appwrite credentials, local `.data/` features (doctors, notifications, jobs, analytics mirror, settings) still work. Appointment **create** via REST returns `501` until Appwrite is configured.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin area: `/admin` (passkey modal). Health check: `GET /api/v1/health`.

## Tests

```bash
npm test
npm run test:watch
```

Vitest config: `vitest.config.ts`. Tests live under `tests/unit` and `tests/integration`.

## Lint / build

```bash
npm run lint
npm run build
```

## Project layout (quick)

- `app/` — pages + API routes
- `lib/services/` — domain services
- `lib/persistence/` — local JSON store
- `lib/api/http.ts` — REST helpers
- `docs/` — architecture & API docs
- `.data/` — local store (created at runtime, gitignored)
