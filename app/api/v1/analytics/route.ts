import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { getCachedAnalytics } from "@/lib/services/analytics.service";
import { listAllMirroredAppointments } from "@/lib/services/appointment-catalog.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const rangeDays = Number(searchParams.get("rangeDays") ?? "30");
    const appointments = await listAllMirroredAppointments();
    const analytics = await getCachedAnalytics(
      appointments,
      Number.isFinite(rangeDays) && rangeDays > 0 ? rangeDays : 30
    );
    return jsonOk(analytics);
  } catch (error) {
    return jsonError(error);
  }
}
