import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { listAllMirroredAppointments } from "@/lib/services/appointment-catalog.service";
import { listDoctors } from "@/lib/services/doctor.service";
import {
  generateAndSaveReport,
  listSavedReports,
  type ReportType,
} from "@/lib/services/report.service";

export const dynamic = "force-dynamic";

const REPORT_TYPES: ReportType[] = [
  "daily_ops",
  "doctor_utilization",
  "cancellation",
];

export async function GET() {
  try {
    await requireAdmin();
    const items = await listSavedReports();
    return jsonOk({ items, total: items.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const type = body?.type as ReportType | undefined;

    if (!type || !REPORT_TYPES.includes(type)) {
      throw validationError(
        `type must be one of: ${REPORT_TYPES.join(", ")}`
      );
    }

    const [appointments, doctors] = await Promise.all([
      listAllMirroredAppointments(),
      listDoctors(),
    ]);

    const report = await generateAndSaveReport(
      type,
      appointments,
      doctors,
      session.userId
    );

    return jsonOk(report, 201);
  } catch (error) {
    return jsonError(error);
  }
}
