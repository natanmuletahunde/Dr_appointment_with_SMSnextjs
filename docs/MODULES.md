# Module Map

| Module | Path | Responsibility |
|--------|------|----------------|
| App shell | `app/layout.tsx`, `app/page.tsx` | Root layout & landing |
| Patient flows | `app/patients/[userId]/**` | Register, book, success |
| Admin UI | `app/admin/**` | Operations dashboard |
| API v1 | `app/api/v1/**` | Versioned REST surface |
| Cron | `app/api/cron/reminders` | Process due reminder jobs |
| HTTP helpers | `lib/api/http.ts` | `jsonOk` / `jsonError` / `requireAdmin` |
| Appointment actions | `lib/actions/appointment.actions.ts` | Appwrite CRUD + mirror + SMS |
| Auth actions | `lib/actions/auth.actions.ts` | Auth-related server actions |
| Patient actions | `lib/actions/patient.actions.ts` | Patient registration |
| Session | `lib/auth/session.ts` | Signed cookie sessions |
| RBAC | `lib/auth/rbac.ts` | Roles & permissions |
| Errors | `lib/errors.ts` | `AppError` + `toErrorResponse` |
| Env | `lib/env.ts` | Zod-validated configuration |
| Logger | `lib/logger.ts` | Structured logging |
| Cache | `lib/cache/memory-cache.ts` | In-process cache |
| Events | `lib/events/bus.ts`, `handlers.ts` | Domain event bus |
| i18n | `lib/i18n/dictionaries.ts` | en/es/fr strings |
| Document store | `lib/persistence/document-store.ts` | `.data` JSON collections |
| Doctors | `lib/services/doctor.service.ts` | Profiles, slots, conflicts |
| Appointment catalog | `lib/services/appointment-catalog.service.ts` | Mirror search & list |
| Analytics | `lib/services/analytics.service.ts` | Snapshots & cache |
| Notifications | `lib/services/notification.service.ts` | Create / list / read |
| Jobs | `lib/services/job.service.ts` | Queue & process workers |
| Audit | `lib/services/audit.service.ts` | Audit log write/list |
| Settings | `lib/services/settings.service.ts` | Clinic settings |
| Comments | `lib/services/comment.service.ts` | Appointment comments |
| Activity | `lib/services/activity.service.ts` | Entity timelines |
| Export | `lib/services/export.service.ts` | CSV / XLSX / PDF |
| Attachments | `lib/services/attachment.service.ts` | Attachment metadata |
| Search | `lib/services/search.service.ts` | Global search across appointments, doctors, audit, notifications |
| Messages | `lib/services/message.service.ts` | Clinic messaging (send / inbox / thread / read) |
| Reports | `lib/services/report.service.ts` | Daily ops, utilization, cancellation reports |
| Waitlist | `lib/services/waitlist.service.ts` | Join waitlist, list, offer slot |
| Domain types | `types/domain.ts` | Shared TypeScript models |
| UI components | `components/**` | Forms, table, shadcn UI |
| Constants | `constants/index.ts` | Doctors seed, form defaults |
| Tests | `tests/**` | Vitest unit & integration |
| Docs | `docs/**` | Architecture, API, setup |

## Dependency direction (preferred)

```
app (UI/API) → lib/actions → lib/services → lib/persistence | Appwrite
                           ↘ lib/auth | lib/cache | lib/errors
```

Avoid importing `app/` from `lib/`. Prefer services over duplicating store access in routes.
