/**
 * Appointment reschedule rules and eligibility checks.
 * Used by patient portal and admin schedule flows.
 */

import { differenceInHours, parseISO } from "date-fns";
import type { AppointmentRecord, ClinicSettings } from "@/types/domain";

export interface RescheduleDecision {
  allowed: boolean;
  reason?: string;
  hoursUntilVisit: number;
}

export function evaluateRescheduleEligibility(
  appointment: Pick<AppointmentRecord, "status" | "schedule">,
  settings: Pick<ClinicSettings, "cancellationWindowHours" | "allowOnlineBooking">,
  now = new Date()
): RescheduleDecision {
  const hoursUntilVisit = differenceInHours(parseISO(appointment.schedule), now);

  if (!settings.allowOnlineBooking) {
    return {
      allowed: false,
      reason: "Online booking changes are disabled by clinic settings",
      hoursUntilVisit,
    };
  }

  if (appointment.status === "cancelled") {
    return {
      allowed: false,
      reason: "Cancelled appointments cannot be rescheduled",
      hoursUntilVisit,
    };
  }

  if (appointment.status === "completed" || appointment.status === "no_show") {
    return {
      allowed: false,
      reason: "Past appointments cannot be rescheduled",
      hoursUntilVisit,
    };
  }

  if (hoursUntilVisit < settings.cancellationWindowHours) {
    return {
      allowed: false,
      reason: `Changes must be made at least ${settings.cancellationWindowHours} hours before the visit`,
      hoursUntilVisit,
    };
  }

  return { allowed: true, hoursUntilVisit };
}

export function evaluateCancellationEligibility(
  appointment: Pick<AppointmentRecord, "status" | "schedule">,
  settings: Pick<ClinicSettings, "cancellationWindowHours">,
  now = new Date()
): RescheduleDecision {
  const hoursUntilVisit = differenceInHours(parseISO(appointment.schedule), now);

  if (appointment.status === "cancelled") {
    return {
      allowed: false,
      reason: "Appointment is already cancelled",
      hoursUntilVisit,
    };
  }

  if (appointment.status === "completed") {
    return {
      allowed: false,
      reason: "Completed appointments cannot be cancelled",
      hoursUntilVisit,
    };
  }

  if (hoursUntilVisit < settings.cancellationWindowHours) {
    return {
      allowed: false,
      reason: `Cancellations must be made at least ${settings.cancellationWindowHours} hours before the visit`,
      hoursUntilVisit,
    };
  }

  return { allowed: true, hoursUntilVisit };
}

export function suggestAlternateSlots(input: {
  preferredIso: string;
  availableIsoTimes: string[];
  limit?: number;
}): string[] {
  const preferred = new Date(input.preferredIso).getTime();
  return [...input.availableIsoTimes]
    .sort(
      (a, b) =>
        Math.abs(new Date(a).getTime() - preferred) -
        Math.abs(new Date(b).getTime() - preferred)
    )
    .slice(0, input.limit ?? 5);
}
