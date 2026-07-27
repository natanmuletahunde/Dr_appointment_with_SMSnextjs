import type { AppointmentRecord } from "@/types/domain";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function iso(offsetMs: number): string {
  return new Date(now + offsetMs).toISOString();
}

export const fixtureAppointments: AppointmentRecord[] = [
  {
    $id: "appt-001",
    $createdAt: iso(-5 * day),
    $updatedAt: iso(-5 * day),
    userId: "user-alice",
    patientId: "patient-alice",
    patientName: "Alice Johnson",
    patientEmail: "alice@example.com",
    primaryPhysician: "John Green",
    reason: "Annual checkup",
    note: "First visit",
    schedule: iso(2 * day),
    status: "scheduled",
    durationMinutes: 30,
  },
  {
    $id: "appt-002",
    $createdAt: iso(-4 * day),
    $updatedAt: iso(-3 * day),
    userId: "user-bob",
    patientId: "patient-bob",
    patientName: "Bob Smith",
    primaryPhysician: "Leila Cameron",
    reason: "Follow-up",
    schedule: iso(-1 * day),
    status: "completed",
    durationMinutes: 30,
  },
  {
    $id: "appt-003",
    $createdAt: iso(-3 * day),
    $updatedAt: iso(-2 * day),
    userId: "user-cara",
    patientId: "patient-cara",
    patientName: "Cara Lee",
    primaryPhysician: "John Green",
    reason: "Consultation",
    schedule: iso(3 * day),
    status: "pending",
    durationMinutes: 30,
  },
  {
    $id: "appt-004",
    $createdAt: iso(-2 * day),
    $updatedAt: iso(-1 * day),
    userId: "user-dan",
    patientId: "patient-dan",
    patientName: "Dan Wu",
    primaryPhysician: "Leila Cameron",
    reason: "Lab review",
    schedule: iso(-12 * 60 * 60 * 1000),
    status: "cancelled",
    cancellationReason: "Patient request",
    durationMinutes: 30,
  },
  {
    $id: "appt-005",
    $createdAt: iso(-1 * day),
    $updatedAt: iso(-1 * day),
    userId: "user-eve",
    patientId: "patient-eve",
    patientName: "Eve Park",
    primaryPhysician: "John Green",
    reason: "Missed visit",
    schedule: iso(-6 * 60 * 60 * 1000),
    status: "no_show",
    durationMinutes: 30,
  },
];
