import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { enqueueJob, listJobs } from "@/lib/services/job.service";
import type { JobStatus, JobType } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const jobs = await listJobs({
      status: (searchParams.get("status") as JobStatus | null) ?? undefined,
      type: (searchParams.get("type") as JobType | null) ?? undefined,
      limit: Number(searchParams.get("limit") ?? "50") || 50,
    });
    return jsonOk({ items: jobs, total: jobs.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body?.type) throw validationError("type is required");

    const job = await enqueueJob({
      type: body.type as JobType,
      payload: body.payload,
      runAt: body.runAt ? new Date(body.runAt) : undefined,
      maxAttempts: body.maxAttempts,
    });
    return jsonOk(job, 201);
  } catch (error) {
    return jsonError(error);
  }
}
