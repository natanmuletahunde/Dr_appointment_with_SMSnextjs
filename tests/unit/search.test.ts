import { describe, expect, it, afterAll } from "vitest";
import {
  createDocument,
  deleteDocument,
} from "@/lib/persistence/document-store";
import { globalSearch } from "@/lib/services/search.service";
import type { AppointmentRecord, DoctorProfile } from "@/types/domain";

const stamp = Date.now();
const created: Array<{ collection: "appointment_mirror" | "doctors" | "audit_logs" | "notifications"; id: string }> = [];

describe("globalSearch", () => {
  afterAll(async () => {
    for (const item of created) {
      await deleteDocument(item.collection, item.id);
    }
  });

  it("finds matches across appointments, doctors, audit, and notifications", async () => {
    const unique = `searchprobe-${stamp}`;

    const appt = (await createDocument("appointment_mirror", {
      userId: `user-${stamp}`,
      patientId: `patient-${stamp}`,
      patientName: `Patient ${unique}`,
      primaryPhysician: "Search Doc",
      reason: `Reason ${unique}`,
      schedule: new Date().toISOString(),
      status: "pending",
      durationMinutes: 30,
    } as Omit<AppointmentRecord, "$id" | "$createdAt" | "$updatedAt">)) as unknown as AppointmentRecord;
    created.push({ collection: "appointment_mirror", id: appt.$id });

    const doctor = (await createDocument("doctors", {
      name: `Dr ${unique}`,
      specialty: `Specialty ${unique}`,
      email: `${unique}@example.com`,
      phone: "555-0000",
      imageUrl: "/x.png",
      bio: "bio",
      yearsExperience: 1,
      languages: ["English"],
      acceptingNewPatients: true,
      averageRating: 5,
      reviewCount: 0,
      workingDays: [1, 2, 3],
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 30,
      isActive: true,
    } as Omit<DoctorProfile, "$id" | "$createdAt" | "$updatedAt">)) as unknown as DoctorProfile;
    created.push({ collection: "doctors", id: doctor.$id });

    const audit = await createDocument("audit_logs", {
      actorId: "admin",
      actorRole: "admin",
      action: "view",
      resourceType: "search",
      resourceId: unique,
      summary: `Audit summary ${unique}`,
    });
    created.push({ collection: "audit_logs", id: audit.$id });

    const notification = await createDocument("notifications", {
      userId: "admin",
      title: `Notice ${unique}`,
      body: `Body ${unique}`,
      type: "system",
      channel: "in_app",
      read: false,
      metadata: {},
    });
    created.push({ collection: "notifications", id: notification.$id });

    const results = await globalSearch(unique);

    expect(results.appointments.some((a) => a.$id === appt.$id)).toBe(true);
    expect(results.doctors.some((d) => d.$id === doctor.$id)).toBe(true);
    expect(results.audit.some((e) => e.$id === audit.$id)).toBe(true);
    expect(results.notifications.some((n) => n.$id === notification.$id)).toBe(
      true
    );
  });

  it("returns empty groups for blank query", async () => {
    const results = await globalSearch("   ");
    expect(results).toEqual({
      appointments: [],
      doctors: [],
      audit: [],
      notifications: [],
    });
  });
});
