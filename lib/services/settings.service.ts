import {
  createDocument,
  listDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { cacheGetOrSet, cacheInvalidate } from "@/lib/cache/memory-cache";
import { getEnv } from "@/lib/env";
import type { ClinicSettings } from "@/types/domain";

const SETTINGS_KEY = "clinic_settings";

function defaultSettings(): Omit<
  ClinicSettings,
  "$id" | "$createdAt" | "$updatedAt"
> {
  const env = getEnv();
  return {
    clinicName: env.CLINIC_NAME,
    timezone: env.CLINIC_TIMEZONE,
    locale: "en",
    supportEmail: "support@carepulse.clinic",
    supportPhone: "+1-555-0100",
    appointmentSlotMinutes: env.APPOINTMENT_SLOT_MINUTES,
    reminderHoursBefore: env.REMINDER_HOURS_BEFORE,
    allowOnlineBooking: true,
    requireInsurance: false,
    cancellationWindowHours: 24,
    brandPrimaryColor: "#24AE7C",
    features: {
      sms: true,
      email: true,
      analytics: true,
      comments: true,
      attachments: true,
      auditLog: true,
    },
  };
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  return cacheGetOrSet("settings:clinic", async () => {
    const docs = (await listDocuments(
      "settings"
    )) as unknown as ClinicSettings[];
    if (docs[0]) return docs[0];
    return (await createDocument(
      "settings",
      defaultSettings(),
      SETTINGS_KEY
    )) as unknown as ClinicSettings;
  }, 60_000);
}

export async function updateClinicSettings(
  patch: Partial<ClinicSettings>
): Promise<ClinicSettings> {
  const current = await getClinicSettings();
  const updated = (await updateDocument("settings", current.$id, {
    ...patch,
    features: {
      ...current.features,
      ...(patch.features ?? {}),
    },
  })) as unknown as ClinicSettings;
  cacheInvalidate("settings:");
  return updated;
}
