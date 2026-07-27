# CarePulse API v1

Base path: `/api/v1`

All JSON responses use `Content-Type: application/json`. Errors follow:

```json
{ "error": { "code": "VALIDATION", "message": "...", "details": {} } }
```

Admin endpoints require a valid `carepulse_session` cookie with `role: "admin"`.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | Public | `{ status, version, time, cache }` |

## Appointments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/appointments` | Public* | Search mirrored appointments |
| POST | `/api/v1/appointments` | — | Create via Appwrite action, or **501** if Appwrite is not configured |
| GET | `/api/v1/appointments/:id` | Public* | Fetch from Appwrite, fallback to local mirror |

**GET query params:** `query`, `status` (comma-separated allowed), `doctor`, `page`, `pageSize`

## Doctors

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/doctors` | Public | List doctors |
| GET | `/api/v1/doctors/:id` | Public | Doctor profile |
| PATCH | `/api/v1/doctors/:id` | Admin | Update profile |
| GET | `/api/v1/doctors/:id/availability` | Public | Slots for `date=YYYY-MM-DD` |

**List filters:** `query`, `specialty`, `activeOnly=true`, `acceptingOnly=true`  
**Availability:** optional `booked` (comma-separated ISO times)

## Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/analytics` | Admin | Cached analytics snapshot |

**Query:** `rangeDays` (default `30`)

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/notifications` | — | Requires `userId`; optional `unreadOnly`, `page`, `pageSize` |
| POST | `/api/v1/notifications` | — | Body: `userId`, `title`, `body`, `type`, optional `channel`, `href`, `metadata` |
| POST | `/api/v1/notifications/:id/read` | — | Body or query: `userId` |

## Audit

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/audit` | Admin | Paginated audit logs |

**Query:** `actorId`, `resourceType`, `resourceId`, `action`, `page`, `pageSize`

## Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/settings` | Public | Clinic settings |
| PUT | `/api/v1/settings` | Admin | Partial update |

## Jobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/jobs` | Admin | List jobs (`status`, `type`, `limit`) |
| POST | `/api/v1/jobs` | Admin | Enqueue `{ type, payload?, runAt?, maxAttempts? }` |
| POST | `/api/v1/jobs/process` | Admin | Process due jobs (`limit` in body) |

## Exports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/exports/appointments` | Admin | Download appointments |

**Query:** `format=xlsx|pdf|csv`, plus search filters `query`, `status`, `doctor`  
**Content-Types:**  
- `csv` → `text/csv`  
- `xlsx` → `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
- `pdf` → `application/pdf`

## Comments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/comments` | — | Requires `appointmentId` |
| POST | `/api/v1/comments` | Session or body authors | Add comment |

## Activity

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/activity` | — | Requires `entityType` + `entityId` |

## Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/search` | Admin | Global search across appointments, doctors, audit logs, admin notifications |

**Query:** `q` (required) — matches patient/doctor/reason/id, doctor name/specialty, audit summary, notification title/body

**Response:** `{ appointments, doctors, audit, notifications }`

## Messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/messages` | — | Inbox (default) or sent folder for `userId` |
| POST | `/api/v1/messages` | — | Send message |
| POST | `/api/v1/messages/:id/read` | — | Mark message read for recipient |

**GET query:** `userId` (required), `folder=inbox|sent`  
**POST body:** `fromUserId`, `toUserId`, `subject`, `body`, optional `threadId`

## Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/reports` | Admin | List saved reports |
| POST | `/api/v1/reports` | Admin | Generate + save a report |

**POST body:** `{ "type": "daily_ops" | "doctor_utilization" | "cancellation" }`

## Waitlist

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/waitlist` | — | List waitlist entries |
| POST | `/api/v1/waitlist` | — | Join waitlist |

**GET query:** optional `status`, `doctor`, `userId`  
**POST body:** `userId`, `patientName`, `preferredDoctor`, `earliestDate`, `latestDate`, `reason`, optional `preferredDays`, `patientEmail`, `patientPhone`, `notes`

## Cron

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/cron/reminders` | Optional `CRON_SECRET` | Runs `processDueJobs` |

When `CRON_SECRET` is set, send `Authorization: Bearer <secret>` or `x-cron-secret: <secret>`.
