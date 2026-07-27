import { cacheStats } from "@/lib/cache/memory-cache";
import { jsonError, jsonOk } from "@/lib/api/http";

export const dynamic = "force-dynamic";

const API_VERSION = "0.1.0";

export async function GET() {
  try {
    return jsonOk({
      status: "ok",
      version: API_VERSION,
      time: new Date().toISOString(),
      cache: cacheStats(),
    });
  } catch (error) {
    return jsonError(error);
  }
}
