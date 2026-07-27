import { describe, expect, it } from "vitest";
import {
  evaluateCancellationEligibility,
  evaluateRescheduleEligibility,
  suggestAlternateSlots,
} from "@/lib/services/reschedule.service";
import { addHours } from "date-fns";

const settings = {
  cancellationWindowHours: 24,
  allowOnlineBooking: true,
};

describe("reschedule rules", () => {
  it("allows reschedule outside cancellation window", () => {
    const decision = evaluateRescheduleEligibility(
      {
        status: "scheduled",
        schedule: addHours(new Date(), 48).toISOString(),
      },
      settings
    );
    expect(decision.allowed).toBe(true);
  });

  it("blocks reschedule inside cancellation window", () => {
    const decision = evaluateRescheduleEligibility(
      {
        status: "scheduled",
        schedule: addHours(new Date(), 6).toISOString(),
      },
      settings
    );
    expect(decision.allowed).toBe(false);
  });

  it("blocks cancelled appointment changes", () => {
    const decision = evaluateCancellationEligibility(
      {
        status: "cancelled",
        schedule: addHours(new Date(), 48).toISOString(),
      },
      settings
    );
    expect(decision.allowed).toBe(false);
  });

  it("suggests nearest alternate slots", () => {
    const preferred = "2026-08-01T10:00:00.000Z";
    const suggestions = suggestAlternateSlots({
      preferredIso: preferred,
      availableIsoTimes: [
        "2026-08-01T15:00:00.000Z",
        "2026-08-01T10:30:00.000Z",
        "2026-08-01T09:00:00.000Z",
      ],
      limit: 2,
    });
    expect(suggestions[0]).toBe("2026-08-01T10:30:00.000Z");
    expect(suggestions).toHaveLength(2);
  });
});
