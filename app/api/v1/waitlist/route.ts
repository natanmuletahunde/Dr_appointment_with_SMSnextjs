import { jsonError, jsonOk } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import {
  joinWaitlist,
  listWaitlist,
  type WaitlistStatus,
} from "@/lib/services/waitlist.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as WaitlistStatus | null;
    const doctor = searchParams.get("doctor") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;

    const items = await listWaitlist({
      status: status || undefined,
      doctor,
      userId,
    });

    return jsonOk({ items, total: items.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (
      !body?.userId ||
      !body?.patientName ||
      !body?.preferredDoctor ||
      !body?.earliestDate ||
      !body?.latestDate ||
      !body?.reason
    ) {
      throw validationError(
        "userId, patientName, preferredDoctor, earliestDate, latestDate, and reason are required"
      );
    }

    const preferredDays = Array.isArray(body.preferredDays)
      ? body.preferredDays.map((d: unknown) => Number(d)).filter((n: number) =>
          Number.isFinite(n)
        )
      : [];

    const entry = await joinWaitlist({
      userId: String(body.userId),
      patientName: String(body.patientName),
      patientEmail: body.patientEmail
        ? String(body.patientEmail)
        : undefined,
      patientPhone: body.patientPhone
        ? String(body.patientPhone)
        : undefined,
      preferredDoctor: String(body.preferredDoctor),
      preferredDays,
      earliestDate: String(body.earliestDate),
      latestDate: String(body.latestDate),
      reason: String(body.reason),
      notes: body.notes ? String(body.notes) : undefined,
    });

    return jsonOk(entry, 201);
  } catch (error) {
    return jsonError(error);
  }
}
