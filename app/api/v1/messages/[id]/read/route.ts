import { jsonError, jsonOk } from "@/lib/api/http";
import { notFound, validationError } from "@/lib/errors";
import { markMessageRead } from "@/lib/services/message.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const userId =
      body?.userId ?? new URL(request.url).searchParams.get("userId");
    if (!userId) throw validationError("userId is required");

    const updated = await markMessageRead(id, String(userId));
    if (!updated) throw notFound("Message not found");
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}
