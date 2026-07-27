import { describe, expect, it } from "vitest";
import {
  detectScheduleConflict,
  ensureDoctorsSeeded,
} from "@/lib/services/doctor.service";

describe("detectScheduleConflict", () => {
  it("detects overlapping slots for a seeded doctor", async () => {
    const doctors = await ensureDoctorsSeeded();
    expect(doctors.length).toBeGreaterThan(0);
    const doctorName = doctors[0].name;
    const slotMinutes = doctors[0].slotMinutes;

    const base = new Date();
    base.setHours(10, 0, 0, 0);
    const scheduleIso = base.toISOString();
    const nearIso = new Date(
      base.getTime() + Math.floor(slotMinutes / 2) * 60_000
    ).toISOString();

    const conflict = await detectScheduleConflict({
      doctorName,
      scheduleIso: nearIso,
      existingSchedules: [
        { id: "a1", schedule: scheduleIso, status: "scheduled" },
      ],
    });

    expect(conflict.conflict).toBe(true);
    expect(conflict.message).toMatch(/already has an appointment/i);
  });

  it("ignores cancelled appointments and distant slots", async () => {
    const doctors = await ensureDoctorsSeeded();
    const doctorName = doctors[0].name;
    const base = new Date();
    base.setHours(14, 0, 0, 0);

    const noConflictCancelled = await detectScheduleConflict({
      doctorName,
      scheduleIso: base.toISOString(),
      existingSchedules: [
        {
          id: "c1",
          schedule: base.toISOString(),
          status: "cancelled",
        },
      ],
    });
    expect(noConflictCancelled.conflict).toBe(false);

    const far = new Date(base.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const noConflictFar = await detectScheduleConflict({
      doctorName,
      scheduleIso: far,
      existingSchedules: [
        { id: "a2", schedule: base.toISOString(), status: "scheduled" },
      ],
    });
    expect(noConflictFar.conflict).toBe(false);
  });
});
