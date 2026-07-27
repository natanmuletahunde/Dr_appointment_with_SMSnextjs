import { z } from "zod";

/**
 * Central env validation. Missing optional collection IDs fall back to the
 * local document store so extended features work in development.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_ENDPOINT: z.string().url().optional(),
  PROJECT_ID: z.string().min(1).optional(),
  API_KEY: z.string().min(1).optional(),
  DATABASE_ID: z.string().min(1).optional(),
  PATIENT_COLLECTION_ID: z.string().min(1).optional(),
  DOCTOR_COLLECTION_ID: z.string().min(1).optional(),
  APPOINTMENT_COLLECTION_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_BUCKET_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_ADMIN_PASSKEY: z.string().min(4).optional(),
  ADMIN_PASSKEY: z.string().min(4).optional(),
  AUDIT_COLLECTION_ID: z.string().optional(),
  NOTIFICATION_COLLECTION_ID: z.string().optional(),
  COMMENT_COLLECTION_ID: z.string().optional(),
  ATTACHMENT_COLLECTION_ID: z.string().optional(),
  SETTINGS_COLLECTION_ID: z.string().optional(),
  ACTIVITY_COLLECTION_ID: z.string().optional(),
  JOB_COLLECTION_ID: z.string().optional(),
  CLINIC_NAME: z.string().default("CarePulse Clinic"),
  CLINIC_TIMEZONE: z.string().default("UTC"),
  APPOINTMENT_SLOT_MINUTES: z.coerce.number().int().positive().default(30),
  REMINDER_HOURS_BEFORE: z.coerce.number().int().positive().default(24),
  FEATURE_LOCAL_STORE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  SMTP_FROM: z.string().email().optional(),
  APP_BASE_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration", parsed.error.flatten());
    throw new Error("Invalid environment configuration");
  }
  cached = parsed.data;
  return cached;
}

export function getAdminPasskey(): string {
  const env = getEnv();
  return (
    env.ADMIN_PASSKEY ||
    env.NEXT_PUBLIC_ADMIN_PASSKEY ||
    "111111"
  );
}

export function hasAppwriteConfig(): boolean {
  const env = getEnv();
  return Boolean(
    env.NEXT_PUBLIC_ENDPOINT &&
      env.PROJECT_ID &&
      env.API_KEY &&
      env.DATABASE_ID
  );
}
