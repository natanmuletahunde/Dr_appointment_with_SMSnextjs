import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { processDueJobs } from "@/lib/services/job.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const limit = Number(body?.limit ?? "10") || 10;
    const results = await processDueJobs(limit);
    return jsonOk({ processed: results.length, jobs: results });
  } catch (error) {
    return jsonError(error);
  }
}
