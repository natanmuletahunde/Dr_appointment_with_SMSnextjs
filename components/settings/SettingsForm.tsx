"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettingsAction } from "@/lib/actions/platform.actions";
import type { ClinicSettings } from "@/types/domain";

type SettingsFormProps = {
  settings: ClinicSettings;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clinicName: settings.clinicName,
    timezone: settings.timezone,
    locale: settings.locale,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    appointmentSlotMinutes: settings.appointmentSlotMinutes,
    reminderHoursBefore: settings.reminderHoursBefore,
    cancellationWindowHours: settings.cancellationWindowHours,
    brandPrimaryColor: settings.brandPrimaryColor,
    allowOnlineBooking: settings.allowOnlineBooking,
    requireInsurance: settings.requireInsurance,
    features: { ...settings.features },
  });

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        await updateSettingsAction(form);
        setMessage("Settings saved.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-3xl space-y-6 rounded-2xl border border-dark-400 bg-dark-400 p-6"
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-16-semibold text-light-200">
          Clinic identity
        </legend>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clinicName" className="shad-input-label">
            Clinic name
          </Label>
          <Input
            id="clinicName"
            className="shad-input"
            value={form.clinicName}
            onChange={(e) => updateField("clinicName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone" className="shad-input-label">
            Timezone
          </Label>
          <Input
            id="timezone"
            className="shad-input"
            value={form.timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale" className="shad-input-label">
            Locale
          </Label>
          <Input
            id="locale"
            className="shad-input"
            value={form.locale}
            onChange={(e) => updateField("locale", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail" className="shad-input-label">
            Support email
          </Label>
          <Input
            id="supportEmail"
            type="email"
            className="shad-input"
            value={form.supportEmail}
            onChange={(e) => updateField("supportEmail", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportPhone" className="shad-input-label">
            Support phone
          </Label>
          <Input
            id="supportPhone"
            className="shad-input"
            value={form.supportPhone}
            onChange={(e) => updateField("supportPhone", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandPrimaryColor" className="shad-input-label">
            Brand color
          </Label>
          <Input
            id="brandPrimaryColor"
            type="color"
            className="shad-input h-11 cursor-pointer p-1"
            value={form.brandPrimaryColor}
            onChange={(e) => updateField("brandPrimaryColor", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-16-semibold text-light-200">
          Scheduling
        </legend>
        <div className="space-y-2">
          <Label htmlFor="slot" className="shad-input-label">
            Slot minutes
          </Label>
          <Input
            id="slot"
            type="number"
            min={5}
            max={180}
            className="shad-input"
            value={form.appointmentSlotMinutes}
            onChange={(e) =>
              updateField("appointmentSlotMinutes", Number(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder" className="shad-input-label">
            Reminder hours
          </Label>
          <Input
            id="reminder"
            type="number"
            min={1}
            max={168}
            className="shad-input"
            value={form.reminderHoursBefore}
            onChange={(e) =>
              updateField("reminderHoursBefore", Number(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cancelWindow" className="shad-input-label">
            Cancel window (hrs)
          </Label>
          <Input
            id="cancelWindow"
            type="number"
            min={0}
            max={168}
            className="shad-input"
            value={form.cancellationWindowHours}
            onChange={(e) =>
              updateField("cancellationWindowHours", Number(e.target.value))
            }
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-16-semibold text-light-200">
          Preferences
        </legend>
        {(
          [
            ["allowOnlineBooking", "Allow online booking"],
            ["requireInsurance", "Require insurance"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-3 text-14-regular text-dark-700"
          >
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => updateField(key, e.target.checked)}
              className="size-4 rounded border-dark-500 bg-dark-400 accent-green-500"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-16-semibold text-light-200">
          Features
        </legend>
        {(
          Object.keys(form.features) as Array<keyof typeof form.features>
        ).map((key) => (
          <label
            key={key}
            className="flex items-center gap-3 text-14-regular capitalize text-dark-700"
          >
            <input
              type="checkbox"
              checked={form.features[key]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  features: { ...prev.features, [key]: e.target.checked },
                }))
              }
              className="size-4 rounded border-dark-500 bg-dark-400 accent-green-500"
            />
            {key.replace(/([A-Z])/g, " $1")}
          </label>
        ))}
      </fieldset>

      {message ? (
        <p className="text-14-regular text-green-500" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="shad-error text-14-regular" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="shad-primary-btn" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
