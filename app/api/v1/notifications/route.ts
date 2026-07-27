import { jsonError, jsonOk } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import {
  createNotification,
  listNotifications,
} from "@/lib/services/notification.service";
import type { NotificationChannel, NotificationType } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) throw validationError("userId query param is required");

    const result = await listNotifications(userId, {
      unreadOnly: searchParams.get("unreadOnly") === "true",
      page: Number(searchParams.get("page") ?? "1") || 1,
      pageSize: Number(searchParams.get("pageSize") ?? "20") || 20,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.userId || !body?.title || !body?.body || !body?.type) {
      throw validationError("userId, title, body, and type are required");
    }

    const item = await createNotification({
      userId: String(body.userId),
      title: String(body.title),
      body: String(body.body),
      type: body.type as NotificationType,
      channel: body.channel as NotificationChannel | undefined,
      href: body.href,
      metadata: body.metadata,
    });
    return jsonOk(item, 201);
  } catch (error) {
    return jsonError(error);
  }
}
