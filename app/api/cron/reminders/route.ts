import { jsonError, jsonOk } from "@/lib/api/http";
import { unauthorized } from "@/lib/errors";
import { processDueJobs } from "@/lib/services/job.service";

export const dynamic = "force-dynamic";

function assertCronSecret(request: Request): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  const header =
    request.headers.get("authorization") ??
    request.headers.get("x-cron-secret");
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : header;
  if (token !== secret) {
    throw unauthorized("Invalid CRON_SECRET");
  }
}

async function handle(request: Request) {
  assertCronSecret(request);
  const { searchParams } = new URL(request.url);
  let limit = Number(searchParams.get("limit") ?? "10") || 10;
  try {
    const body = await request.clone().json();
    if (body?.limit) limit = Number(body.limit) || limit;
  } catch {
    // GET or empty body
  }
  const jobs = await processDueJobs(limit);
  return jsonOk({
    ok: true,
    processed: jobs.length,
    jobs,
    at: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return jsonError(error);
  }
}
