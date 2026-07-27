# CarePulse Database

CarePulse uses two persistence backends:

1. **Appwrite** — primary cloud database for patients, appointments, and file storage.
2. **Local document store** (`.data/*.json`) — extended platform features that work offline / without new Appwrite collections.

---

## Appwrite collections

Configured via environment variables (see `lib/appwrite.config.ts` and `lib/env.ts`):

| Collection env | Purpose | Typical fields |
|----------------|---------|----------------|
| `PATIENT_COLLECTION_ID` | Registered patients | name, email, phone, demographics, consents, physician |
| `APPOINTMENT_COLLECTION_ID` | Appointments | userId, patient, schedule, status, primaryPhysician, reason, note, cancellationReason |
| `DOCTOR_COLLECTION_ID` | Optional Appwrite doctors | name, image (seed also mirrored locally) |
| `NEXT_PUBLIC_BUCKET_ID` | Identification / attachment files | binary blobs |

Optional extended collection IDs (`AUDIT_COLLECTION_ID`, `NOTIFICATION_COLLECTION_ID`, etc.) may be wired later; today those domains default to the local store.

### Appwrite auth / messaging

- `Users` API for patient accounts
- `Messaging` SMS for schedule/cancel notifications

---

## Local `.data` store

Root: `.data/` (gitignored). Each collection is a JSON array file.

| File | Collection key | Used by |
|------|----------------|---------|
| `doctors.json` | `doctors` | Doctor profiles & seeding |
| `doctor_exceptions.json` | `doctor_exceptions` | Availability exceptions |
| `notifications.json` | `notifications` | In-app / email stubs |
| `audit_logs.json` | `audit_logs` | Audit trail |
| `activities.json` | `activities` | Entity timelines |
| `comments.json` | `comments` | Appointment comments |
| `attachments.json` | `attachments` | Attachment metadata |
| `settings.json` | `settings` | Clinic settings singleton |
| `jobs.json` | `jobs` | Background job queue |
| `appointment_mirror.json` | `appointment_mirror` | Search/analytics catalog |
| `metrics.json` | `metrics` | Misc metrics / tests |

### Document shape

Every stored document includes:

```ts
{
  $id: string;
  $createdAt: string; // ISO
  $updatedAt: string; // ISO
  ...fields
}
```

API: `createDocument`, `getDocument`, `listDocuments`, `updateDocument`, `deleteDocument`, `queryDocuments` in `lib/persistence/document-store.ts`.

### Atomic writes

Updates write to a temporary file then rename into place to reduce corruption risk on crash.

---

## Sync notes

- Creating/updating appointments via server actions calls `mirrorAppointment` so search & analytics stay warm even when Appwrite is the source of truth.
- Doctor seeds hydrate from `constants/Doctors` into the local `doctors` collection on first read.
