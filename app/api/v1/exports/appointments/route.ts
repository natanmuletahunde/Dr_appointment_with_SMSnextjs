import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { searchAppointments } from "@/lib/services/appointment-catalog.service";
import {
  exportAppointmentsToCsv,
  exportAppointmentsToExcel,
  exportAppointmentsToPdf,
} from "@/lib/services/export.service";
import type { AppointmentStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") ?? "csv").toLowerCase();
    if (!["xlsx", "pdf", "csv"].includes(format)) {
      throw validationError("format must be xlsx, pdf, or csv");
    }

    const statusParam = searchParams.get("status");
    const result = await searchAppointments({
      query: searchParams.get("query") ?? undefined,
      doctor: searchParams.get("doctor") ?? undefined,
      status: statusParam
        ? (statusParam as AppointmentStatus)
        : undefined,
      page: 1,
      pageSize: 1000,
    });

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const csv = exportAppointmentsToCsv(result.items);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointments-${stamp}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const buffer = exportAppointmentsToExcel(result.items);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="appointments-${stamp}.xlsx"`,
        },
      });
    }

    const pdf = exportAppointmentsToPdf(result.items);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="appointments-${stamp}.pdf"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
