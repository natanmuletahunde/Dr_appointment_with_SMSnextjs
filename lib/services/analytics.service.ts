import {
  addDays,
  differenceInHours,
  format,
  getDay,
  getHours,
  isAfter,
  isBefore,
  parseISO,
  subDays,
} from "date-fns";
import { cacheGetOrSet } from "@/lib/cache/memory-cache";
import type {
  AnalyticsSnapshot,
  AppointmentRecord,
  AppointmentStatus,
} from "@/types/domain";

function statusOf(a: AppointmentRecord): AppointmentStatus {
  return a.status;
}

export function computeAnalytics(
  appointments: AppointmentRecord[],
  rangeDays = 30
): AnalyticsSnapshot {
  const now = new Date();
  const from = subDays(now, rangeDays);

  const inRange = appointments.filter((a) => {
    const created = parseISO(a.$createdAt);
    const schedule = parseISO(a.schedule);
    return (
      (isAfter(created, from) && isBefore(created, addDays(now, 1))) ||
      (isAfter(schedule, from) && isBefore(schedule, addDays(now, 1)))
    );
  });

  const totals = {
    appointments: inRange.length,
    scheduled: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    noShow: 0,
  };

  const byDoctorMap = new Map<string, { count: number; scheduled: number }>();
  const byDayMap = new Map<string, { count: number; cancelled: number }>();
  const byStatusMap = new Map<AppointmentStatus, number>();
  const hourCounts = new Array(24).fill(0);
  const dowCounts = new Array(7).fill(0);
  let leadTimeSum = 0;

  for (const appt of inRange) {
    const st = statusOf(appt);
    totals[
      st === "scheduled"
        ? "scheduled"
        : st === "pending"
          ? "pending"
          : st === "cancelled"
            ? "cancelled"
            : st === "completed"
              ? "completed"
              : st === "no_show"
                ? "noShow"
                : "pending"
    ] += 1;

    byStatusMap.set(st, (byStatusMap.get(st) ?? 0) + 1);

    const doctorStats = byDoctorMap.get(appt.primaryPhysician) ?? {
      count: 0,
      scheduled: 0,
    };
    doctorStats.count += 1;
    if (st === "scheduled" || st === "completed") doctorStats.scheduled += 1;
    byDoctorMap.set(appt.primaryPhysician, doctorStats);

    const dayKey = format(parseISO(appt.schedule), "yyyy-MM-dd");
    const dayStats = byDayMap.get(dayKey) ?? { count: 0, cancelled: 0 };
    dayStats.count += 1;
    if (st === "cancelled") dayStats.cancelled += 1;
    byDayMap.set(dayKey, dayStats);

    const scheduleDate = parseISO(appt.schedule);
    hourCounts[getHours(scheduleDate)] += 1;
    dowCounts[getDay(scheduleDate)] += 1;

    leadTimeSum += Math.max(
      0,
      differenceInHours(scheduleDate, parseISO(appt.$createdAt))
    );
  }

  const cancellationRate =
    totals.appointments === 0 ? 0 : totals.cancelled / totals.appointments;
  const completionRate =
    totals.appointments === 0 ? 0 : totals.completed / totals.appointments;

  return {
    generatedAt: now.toISOString(),
    rangeDays,
    totals,
    byDoctor: [...byDoctorMap.entries()]
      .map(([doctor, stats]) => ({ doctor, ...stats }))
      .sort((a, b) => b.count - a.count),
    byDay: [...byDayMap.entries()]
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byStatus: [...byStatusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
    averageLeadTimeHours:
      totals.appointments === 0 ? 0 : leadTimeSum / totals.appointments,
    cancellationRate,
    completionRate,
    busiestHour: hourCounts.indexOf(Math.max(...hourCounts)),
    peakDayOfWeek: dowCounts.indexOf(Math.max(...dowCounts)),
  };
}

export async function getCachedAnalytics(
  appointments: AppointmentRecord[],
  rangeDays = 30
): Promise<AnalyticsSnapshot> {
  const fingerprint = `${appointments.length}:${rangeDays}:${appointments[0]?.$updatedAt ?? "none"}`;
  return cacheGetOrSet(
    `analytics:${fingerprint}`,
    async () => computeAnalytics(appointments, rangeDays),
    20_000
  );
}
