import { describe, expect, it } from "vitest";
import { computeAnalytics } from "@/lib/services/analytics.service";
import { fixtureAppointments } from "@/tests/mocks/appointments";

describe("computeAnalytics", () => {
  it("aggregates totals and rates from fixture appointments", () => {
    const snapshot = computeAnalytics(fixtureAppointments, 30);

    expect(snapshot.rangeDays).toBe(30);
    expect(snapshot.totals.appointments).toBe(fixtureAppointments.length);
    expect(snapshot.totals.scheduled).toBe(1);
    expect(snapshot.totals.completed).toBe(1);
    expect(snapshot.totals.pending).toBe(1);
    expect(snapshot.totals.cancelled).toBe(1);
    expect(snapshot.totals.noShow).toBe(1);
    expect(snapshot.cancellationRate).toBeCloseTo(1 / 5);
    expect(snapshot.completionRate).toBeCloseTo(1 / 5);
    expect(snapshot.byDoctor.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.byStatus.map((s) => s.status)).toEqual(
      expect.arrayContaining([
        "scheduled",
        "completed",
        "pending",
        "cancelled",
        "no_show",
      ])
    );
  });

  it("returns zero rates for empty input", () => {
    const snapshot = computeAnalytics([], 7);
    expect(snapshot.totals.appointments).toBe(0);
    expect(snapshot.cancellationRate).toBe(0);
    expect(snapshot.completionRate).toBe(0);
    expect(snapshot.averageLeadTimeHours).toBe(0);
  });
});
