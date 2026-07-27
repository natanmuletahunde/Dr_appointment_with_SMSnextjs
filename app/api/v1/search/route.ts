import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { globalSearch } from "@/lib/services/search.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    if (!q.trim()) throw validationError("q query param is required");

    const result = await globalSearch(q);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
