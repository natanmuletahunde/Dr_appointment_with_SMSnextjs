import { jsonError, jsonOk } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import {
  listInbox,
  listSent,
  sendMessage,
} from "@/lib/services/message.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) throw validationError("userId query param is required");

    const folder = searchParams.get("folder") ?? "inbox";
    const items =
      folder === "sent" ? await listSent(userId) : await listInbox(userId);

    return jsonOk({ items, total: items.length, folder });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.fromUserId || !body?.toUserId || !body?.subject || !body?.body) {
      throw validationError(
        "fromUserId, toUserId, subject, and body are required"
      );
    }

    const message = await sendMessage({
      fromUserId: String(body.fromUserId),
      toUserId: String(body.toUserId),
      subject: String(body.subject),
      body: String(body.body),
      threadId: body.threadId ? String(body.threadId) : undefined,
    });

    return jsonOk(message, 201);
  } catch (error) {
    return jsonError(error);
  }
}
