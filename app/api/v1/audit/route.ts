import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { listAuditLogs } from "@/lib/services/audit.service";
import type { AuditAction } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const result = await listAuditLogs({
      actorId: searchParams.get("actorId") ?? undefined,
      resourceType: searchParams.get("resourceType") ?? undefined,
      resourceId: searchParams.get("resourceId") ?? undefined,
      action: (searchParams.get("action") as AuditAction | null) ?? undefined,
      page: Number(searchParams.get("page") ?? "1") || 1,
      pageSize: Number(searchParams.get("pageSize") ?? "25") || 25,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
