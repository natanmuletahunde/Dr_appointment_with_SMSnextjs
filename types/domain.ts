/** Domain models for CarePulse extended platform features. */

export type UserRole = "patient" | "doctor" | "admin" | "nurse" | "receptionist";

export type Permission =
  | "appointments:read"
  | "appointments:write"
  | "appointments:schedule"
  | "appointments:cancel"
  | "patients:read"
  | "patients:write"
  | "doctors:read"
  | "doctors:write"
  | "analytics:read"
  | "audit:read"
  | "notifications:read"
  | "notifications:write"
  | "settings:read"
  | "settings:write"
  | "comments:read"
  | "comments:write"
  | "attachments:read"
  | "attachments:write"
  | "exports:run"
  | "jobs:manage";

export type AppointmentStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type NotificationChannel = "in_app" | "sms" | "email";

export type NotificationType =
  | "appointment_created"
  | "appointment_scheduled"
  | "appointment_cancelled"
  | "appointment_reminder"
  | "appointment_rescheduled"
  | "comment_added"
  | "attachment_added"
  | "system";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "login"
  | "logout"
  | "schedule"
  | "cancel"
  | "reschedule"
  | "approve"
  | "reject";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type JobType =
  | "appointment_reminder"
  | "daily_digest"
  | "export_report"
  | "purge_old_notifications"
  | "sync_doctor_availability"
  | "analytics_rollup";

export interface BaseEntity {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface DoctorProfile extends BaseEntity {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  imageUrl: string;
  bio: string;
  yearsExperience: number;
  languages: string[];
  acceptingNewPatients: boolean;
  roomNumber?: string;
  averageRating: number;
  reviewCount: number;
  workingDays: number[]; // 0=Sun ... 6=Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotMinutes: number;
  isActive: boolean;
}

export interface DoctorAvailabilityException extends BaseEntity {
  doctorId: string;
  date: string; // YYYY-MM-DD
  isUnavailable: boolean;
  reason?: string;
  customStartTime?: string;
  customEndTime?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export interface NotificationItem extends BaseEntity {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  channel: NotificationChannel;
  read: boolean;
  href?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry extends BaseEntity {
  actorId: string;
  actorRole: UserRole | "system";
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  summary: string;
  ip?: string;
  userAgent?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export interface ActivityEvent extends BaseEntity {
  entityType: string;
  entityId: string;
  actorId: string;
  actorName: string;
  verb: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AppointmentComment extends BaseEntity {
  appointmentId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  isInternal: boolean;
}

export interface AppointmentAttachment extends BaseEntity {
  appointmentId: string;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  description?: string;
}

export interface ClinicSettings extends BaseEntity {
  clinicName: string;
  timezone: string;
  locale: string;
  supportEmail: string;
  supportPhone: string;
  appointmentSlotMinutes: number;
  reminderHoursBefore: number;
  allowOnlineBooking: boolean;
  requireInsurance: boolean;
  cancellationWindowHours: number;
  brandPrimaryColor: string;
  features: {
    sms: boolean;
    email: boolean;
    analytics: boolean;
    comments: boolean;
    attachments: boolean;
    auditLog: boolean;
  };
}

export interface BackgroundJob extends BaseEntity {
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  runAt: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
  result?: Record<string, unknown>;
}

export interface PatientProfileSummary {
  userId: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  primaryPhysician: string;
  allergies?: string;
  currentMedication?: string;
}

export interface AppointmentRecord extends BaseEntity {
  userId: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  primaryPhysician: string;
  doctorId?: string;
  reason: string;
  note?: string;
  schedule: string;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  durationMinutes: number;
  location?: string;
  tags?: string[];
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  rangeDays: number;
  totals: {
    appointments: number;
    scheduled: number;
    pending: number;
    cancelled: number;
    completed: number;
    noShow: number;
  };
  byDoctor: Array<{ doctor: string; count: number; scheduled: number }>;
  byDay: Array<{ date: string; count: number; cancelled: number }>;
  byStatus: Array<{ status: AppointmentStatus; count: number }>;
  averageLeadTimeHours: number;
  cancellationRate: number;
  completionRate: number;
  busiestHour: number;
  peakDayOfWeek: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  doctor?: string;
  from?: string;
  to?: string;
  patientId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "schedule" | "createdAt" | "status" | "patientName";
  sortDir?: "asc" | "desc";
}

export interface ExportColumn {
  key: string;
  header: string;
}

export interface RoleDefinition {
  role: UserRole;
  permissions: Permission[];
  description: string;
}
