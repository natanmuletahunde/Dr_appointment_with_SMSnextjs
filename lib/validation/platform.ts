import { z } from "zod";

export const SearchAppointmentsQuerySchema = z.object({
  query: z.string().max(200).optional(),
  status: z
    .enum([
      "pending",
      "scheduled",
      "cancelled",
      "completed",
      "no_show",
      "rescheduled",
    ])
    .optional(),
  doctor: z.string().max(120).optional(),
  from: z.string().datetime().optional().or(z.string().optional()),
  to: z.string().datetime().optional().or(z.string().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["schedule", "createdAt", "status", "patientName"])
    .default("schedule"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const CreateCommentSchema = z.object({
  appointmentId: z.string().min(1),
  body: z.string().min(2).max(4000),
  isInternal: z.boolean().optional().default(false),
  authorName: z.string().min(1).max(120).optional(),
  notifyUserId: z.string().optional(),
});

export const DoctorUpdateSchema = z.object({
  bio: z.string().max(2000).optional(),
  acceptingNewPatients: z.boolean().optional(),
  roomNumber: z.string().max(40).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  slotMinutes: z.number().int().min(10).max(120).optional(),
  isActive: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
});

export const ClinicSettingsUpdateSchema = z.object({
  clinicName: z.string().min(2).max(120).optional(),
  timezone: z.string().min(2).max(80).optional(),
  locale: z.enum(["en", "es", "fr"]).optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().min(5).max(40).optional(),
  appointmentSlotMinutes: z.number().int().min(10).max(120).optional(),
  reminderHoursBefore: z.number().int().min(1).max(168).optional(),
  allowOnlineBooking: z.boolean().optional(),
  requireInsurance: z.boolean().optional(),
  cancellationWindowHours: z.number().int().min(0).max(168).optional(),
  brandPrimaryColor: z.string().max(20).optional(),
  features: z
    .object({
      sms: z.boolean().optional(),
      email: z.boolean().optional(),
      analytics: z.boolean().optional(),
      comments: z.boolean().optional(),
      attachments: z.boolean().optional(),
      auditLog: z.boolean().optional(),
    })
    .optional(),
});

export const EnqueueJobSchema = z.object({
  type: z.enum([
    "appointment_reminder",
    "daily_digest",
    "export_report",
    "purge_old_notifications",
    "sync_doctor_availability",
    "analytics_rollup",
  ]),
  payload: z.record(z.string(), z.unknown()).optional(),
  runAt: z.string().datetime().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
});

export const AvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
