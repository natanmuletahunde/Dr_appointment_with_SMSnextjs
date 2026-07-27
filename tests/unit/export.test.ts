import { describe, expect, it } from "vitest";
import {
  APPOINTMENT_EXPORT_COLUMNS,
  exportAppointmentsToCsv,
} from "@/lib/services/export.service";
import { fixtureAppointments } from "@/tests/mocks/appointments";

describe("exportAppointmentsToCsv", () => {
  it("includes column headers and appointment rows", () => {
    const csv = exportAppointmentsToCsv(fixtureAppointments);
    const lines = csv.split("\n");
    expect(lines.length).toBe(fixtureAppointments.length + 1);

    for (const col of APPOINTMENT_EXPORT_COLUMNS) {
      expect(lines[0]).toContain(col.header);
    }

    expect(csv).toContain("Alice Johnson");
    expect(csv).toContain("John Green");
    expect(csv).toContain("appt-001");
  });

  it("exports header-only CSV for empty lists", () => {
    const csv = exportAppointmentsToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
    expect(csv).toContain("Appointment ID");
    expect(csv).toContain("Patient");
  });
});
