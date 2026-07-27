import { jsonError, jsonOk } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { listActivityTimeline } from "@/lib/services/activity.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    if (!entityType || !entityId) {
      throw validationError("entityType and entityId query params are required");
    }

    const result = await listActivityTimeline(entityType, entityId, {
      page: Number(searchParams.get("page") ?? "1") || 1,
      pageSize: Number(searchParams.get("pageSize") ?? "30") || 30,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
