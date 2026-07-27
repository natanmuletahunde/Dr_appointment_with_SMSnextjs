import { describe, expect, it } from "vitest";
import {
  generateCancellationReport,
  generateDailyOpsReport,
  generateDoctorUtilizationReport,
} from "@/lib/services/report.service";
import { fixtureAppointments } from "@/tests/mocks/appointments";
import type { DoctorProfile } from "@/types/domain";

const fixtureDoctors: DoctorProfile[] = [
  {
    $id: "doc-1",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: "John Green",
    specialty: "Cardiology",
    email: "green@example.com",
    phone: "555-0100",
    imageUrl: "/assets/images/dr-green.png",
    bio: "Test",
    yearsExperience: 10,
    languages: ["English"],
    acceptingNewPatients: true,
    averageRating: 4.8,
    reviewCount: 12,
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 30,
    isActive: true,
  },
  {
    $id: "doc-2",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: "Leila Cameron",
    specialty: "Dermatology",
    email: "cameron@example.com",
    phone: "555-0101",
    imageUrl: "/assets/images/dr-cameron.png",
    bio: "Test",
    yearsExperience: 8,
    languages: ["English"],
    acceptingNewPatients: true,
    averageRating: 4.6,
    reviewCount: 9,
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 30,
    isActive: true,
  },
];

describe("report generators", () => {
  it("builds daily ops KPIs from appointments", () => {
    const report = generateDailyOpsReport(fixtureAppointments);
    expect(report.type).toBe("daily_ops");
    expect(report.kpis.totalAppointments).toBeGreaterThanOrEqual(0);
    expect(report.kpis.cancellationRate).toBeGreaterThanOrEqual(0);
    expect(report.byStatus.length).toBeGreaterThan(0);
  });

  it("computes doctor utilization shares", () => {
    const report = generateDoctorUtilizationReport(
      fixtureAppointments,
      fixtureDoctors
    );
    expect(report.type).toBe("doctor_utilization");
    expect(report.totals.appointments).toBe(fixtureAppointments.length);
    expect(report.doctors.length).toBeGreaterThanOrEqual(2);
    const john = report.doctors.find((d) => d.doctor === "John Green");
    expect(john?.appointmentCount).toBe(3);
    expect(john?.specialty).toBe("Cardiology");
    const shareSum = report.doctors.reduce(
      (sum, d) => sum + d.utilizationShare,
      0
    );
    expect(shareSum).toBeCloseTo(1, 5);
  });

  it("summarizes cancellations by reason and doctor", () => {
    const report = generateCancellationReport(fixtureAppointments);
    expect(report.type).toBe("cancellation");
    expect(report.totals.cancelled).toBe(1);
    expect(report.totals.cancellationRate).toBeCloseTo(1 / 5);
    expect(report.byReason[0]?.reason).toBe("Patient request");
    expect(report.recent).toHaveLength(1);
    expect(report.recent[0]?.patientName).toBe("Dan Wu");
  });
});
