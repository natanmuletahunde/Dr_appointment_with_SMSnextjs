import { Doctors } from "@/constants";
import {
  createDocument,
  getDocument,
  listDocuments,
  queryDocuments,
  updateDocument,
} from "@/lib/persistence/document-store";
import { cacheGetOrSet, cacheInvalidate } from "@/lib/cache/memory-cache";
import { notFound, validationError } from "@/lib/errors";
import type {
  DoctorAvailabilityException,
  DoctorProfile,
  TimeSlot,
} from "@/types/domain";
import {
  addMinutes,
  format,
  isBefore,
  parse,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

function seedFromConstants(): Omit<
  DoctorProfile,
  "$id" | "$createdAt" | "$updatedAt"
>[] {
  const specialties = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Oncology",
    "Internal Medicine",
  ];

  return Doctors.map((doctor, index) => ({
    name: doctor.name,
    specialty: specialties[index % specialties.length],
    email: `${doctor.name.toLowerCase().replace(/\s+/g, ".")}@carepulse.clinic`,
    phone: `+1555000${String(1000 + index)}`,
    imageUrl: doctor.image,
    bio: `Dr. ${doctor.name} provides compassionate, evidence-based care at CarePulse.`,
    yearsExperience: 8 + (index % 15),
    languages: index % 2 === 0 ? ["English"] : ["English", "Spanish"],
    acceptingNewPatients: index !== 3,
    roomNumber: `R-${100 + index}`,
    averageRating: Number((4.2 + (index % 8) * 0.1).toFixed(1)),
    reviewCount: 20 + index * 7,
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 30,
    isActive: true,
  }));
}

export async function ensureDoctorsSeeded(): Promise<DoctorProfile[]> {
  return cacheGetOrSet("doctors:all", async () => {
    let doctors = (await listDocuments(
      "doctors"
    )) as unknown as DoctorProfile[];
    if (doctors.length === 0) {
      for (const seed of seedFromConstants()) {
        await createDocument("doctors", seed);
      }
      doctors = (await listDocuments("doctors")) as unknown as DoctorProfile[];
    }
    return doctors;
  }, 60_000);
}

export async function listDoctors(options?: {
  activeOnly?: boolean;
  specialty?: string;
  acceptingOnly?: boolean;
  query?: string;
}): Promise<DoctorProfile[]> {
  let doctors = await ensureDoctorsSeeded();
  if (options?.activeOnly) doctors = doctors.filter((d) => d.isActive);
  if (options?.acceptingOnly)
    doctors = doctors.filter((d) => d.acceptingNewPatients);
  if (options?.specialty)
    doctors = doctors.filter(
      (d) => d.specialty.toLowerCase() === options.specialty!.toLowerCase()
    );
  if (options?.query) {
    const q = options.query.toLowerCase();
    doctors = doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.languages.some((l) => l.toLowerCase().includes(q))
    );
  }
  return doctors.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDoctorById(id: string): Promise<DoctorProfile> {
  const doctor = (await getDocument(
    "doctors",
    id
  )) as unknown as DoctorProfile | null;
  if (!doctor) throw notFound("Doctor not found");
  return doctor;
}

export async function getDoctorByName(
  name: string
): Promise<DoctorProfile | null> {
  const doctors = await ensureDoctorsSeeded();
  return (
    doctors.find((d) => d.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

export async function updateDoctorProfile(
  id: string,
  patch: Partial<DoctorProfile>
): Promise<DoctorProfile> {
  const updated = (await updateDocument(
    "doctors",
    id,
    patch as Record<string, unknown>
  )) as unknown as DoctorProfile | null;
  if (!updated) throw notFound("Doctor not found");
  cacheInvalidate("doctors:");
  return updated;
}

export async function addAvailabilityException(
  input: Omit<
    DoctorAvailabilityException,
    "$id" | "$createdAt" | "$updatedAt"
  >
): Promise<DoctorAvailabilityException> {
  if (!input.doctorId || !input.date) {
    throw validationError("doctorId and date are required");
  }
  return (await createDocument(
    "doctor_exceptions",
    input
  )) as unknown as DoctorAvailabilityException;
}

export async function listAvailabilityExceptions(
  doctorId: string,
  from?: string,
  to?: string
): Promise<DoctorAvailabilityException[]> {
  const { documents } = await queryDocuments<
    DoctorAvailabilityException & { $id: string; $createdAt: string; $updatedAt: string }
  >("doctor_exceptions", (doc) => {
    if (doc.doctorId !== doctorId) return false;
    if (from && doc.date < from) return false;
    if (to && doc.date > to) return false;
    return true;
  });
  return documents;
}

function buildDaySlots(
  doctor: DoctorProfile,
  date: Date,
  bookedStarts: Set<string>,
  exception?: DoctorAvailabilityException
): TimeSlot[] {
  if (exception?.isUnavailable) {
    return [];
  }

  const day = date.getDay();
  if (!doctor.workingDays.includes(day) && !exception?.customStartTime) {
    return [];
  }

  const startStr = exception?.customStartTime ?? doctor.startTime;
  const endStr = exception?.customEndTime ?? doctor.endTime;
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);

  let cursor = setMinutes(setHours(startOfDay(date), sh), sm);
  const end = setMinutes(setHours(startOfDay(date), eh), em);
  const slots: TimeSlot[] = [];

  while (isBefore(cursor, end)) {
    const slotEnd = addMinutes(cursor, doctor.slotMinutes);
    if (isBefore(end, slotEnd)) break;
    const key = format(cursor, "HH:mm");
    const available = !bookedStarts.has(key);
    slots.push({
      start: cursor.toISOString(),
      end: slotEnd.toISOString(),
      available,
      reason: available ? undefined : "Already booked",
    });
    cursor = slotEnd;
  }

  return slots;
}

export async function getAvailableSlots(input: {
  doctorIdOrName: string;
  date: string; // YYYY-MM-DD
  bookedIsoTimes?: string[];
}): Promise<TimeSlot[]> {
  const doctor =
    (await getDoctorByName(input.doctorIdOrName)) ||
    (await getDoctorById(input.doctorIdOrName).catch(() => null));
  if (!doctor) throw notFound("Doctor not found");
  if (!doctor.isActive) return [];

  const date = parse(input.date, "yyyy-MM-dd", new Date());
  const exceptions = await listAvailabilityExceptions(
    doctor.$id,
    input.date,
    input.date
  );
  const exception = exceptions[0];

  const bookedStarts = new Set(
    (input.bookedIsoTimes ?? []).map((iso) => format(new Date(iso), "HH:mm"))
  );

  return buildDaySlots(doctor, date, bookedStarts, exception);
}

export async function detectScheduleConflict(input: {
  doctorName: string;
  scheduleIso: string;
  excludeAppointmentId?: string;
  existingSchedules: Array<{ id: string; schedule: string; status: string }>;
}): Promise<{ conflict: boolean; message?: string }> {
  const doctor = await getDoctorByName(input.doctorName);
  const slotMinutes = doctor?.slotMinutes ?? 30;
  const target = new Date(input.scheduleIso).getTime();

  for (const existing of input.existingSchedules) {
    if (existing.id === input.excludeAppointmentId) continue;
    if (existing.status === "cancelled") continue;
    const other = new Date(existing.schedule).getTime();
    if (Math.abs(other - target) < slotMinutes * 60_000) {
      return {
        conflict: true,
        message: `Dr. ${input.doctorName} already has an appointment within this time slot`,
      };
    }
  }

  return { conflict: false };
}
