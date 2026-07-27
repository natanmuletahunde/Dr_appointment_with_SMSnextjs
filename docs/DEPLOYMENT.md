# Deployment

## Recommended targets

- **Vercel** (Next.js App Router)
- **Docker / Node host** (`next build` + `next start`)
- Any platform that supports Node 20+ and persistent disk if you rely on `.data/`

## Build

```bash
npm ci
npm run build
npm start
```

Set production environment variables in the host (never commit `.env*`).

## Critical env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_ENDPOINT` | For Appwrite | Appwrite endpoint |
| `PROJECT_ID` / `API_KEY` | For Appwrite | Server SDK |
| `DATABASE_ID` + collection IDs | For Appwrite | Patients & appointments |
| `ADMIN_PASSKEY` or `NEXT_PUBLIC_ADMIN_PASSKEY` | Yes | Session signing + admin gate |
| `CRON_SECRET` | Recommended | Protect `/api/cron/reminders` |
| `APP_BASE_URL` | Recommended | Absolute links in notifications |
| `FEATURE_LOCAL_STORE` | Default true | Local JSON persistence |

## Local store on serverless

`.data/` is filesystem-backed. On ephemeral serverless (e.g. default Vercel) writes do **not** persist across instances. Options:

1. Provision Appwrite (or another DB) collections for notifications/jobs/audit and adapt services.
2. Mount durable volume / use a stateful Node host for `.data`.
3. Keep Appwrite as source of truth and treat local mirror as cache-only.

## Cron / reminders

Schedule a periodic call:

```http
POST /api/cron/reminders
Authorization: Bearer $CRON_SECRET
```

Examples: Vercel Cron, GitHub Actions, system crontab, or Azure Logic Apps.

Admin can also trigger `POST /api/v1/jobs/process` while authenticated.

## Health checks

Probe `GET /api/v1/health` — expects `{ status: "ok", version, time, cache }`.

## Sentry

`@sentry/nextjs` is included. Configure Sentry project DSN / build plugin env as needed for production error tracking.

## Security checklist

- [ ] Strong admin passkey (not `111111`)
- [ ] `CRON_SECRET` set
- [ ] HTTPS only; secure cookies in production (`NODE_ENV=production`)
- [ ] Appwrite API key scoped to required collections
- [ ] `.data/` excluded from public web root / git
