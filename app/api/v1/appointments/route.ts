import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/http";
import { hasAppwriteConfig } from "@/lib/env";
import { validationError } from "@/lib/errors";
import { searchAppointments } from "@/lib/services/appointment-catalog.service";
import type { AppointmentStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? undefined;
    const statusParam = searchParams.get("status");
    const doctor = searchParams.get("doctor") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    let status: AppointmentStatus | AppointmentStatus[] | undefined;
    if (statusParam) {
      status = statusParam.includes(",")
        ? (statusParam.split(",") as AppointmentStatus[])
        : (statusParam as AppointmentStatus);
    }

    const result = await searchAppointments({
      query,
      status,
      doctor,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    });

    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!hasAppwriteConfig()) {
      return NextResponse.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message:
              "Appointment creation via REST requires Appwrite. Configure NEXT_PUBLIC_ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, and APPOINTMENT_COLLECTION_ID, or use the patient booking UI / createAppointment server action.",
          },
        },
        { status: 501 }
      );
    }

    const body = await request.json();
    if (!body?.userId || !body?.primaryPhysician || !body?.schedule) {
      throw validationError(
        "userId, primaryPhysician, schedule, patient, status, and reason are required",
        body
      );
    }

    const { createAppointment } = await import(
      "@/lib/actions/appointment.actions"
    );
    const created = await createAppointment(body);
    return jsonOk(created, 201);
  } catch (error) {
    return jsonError(error);
  }
}
