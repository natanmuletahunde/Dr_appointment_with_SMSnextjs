import { jsonError, jsonOk } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";
import { unauthorized, validationError } from "@/lib/errors";
import {
  addAppointmentComment,
  listAppointmentComments,
} from "@/lib/services/comment.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");
    if (!appointmentId) {
      throw validationError("appointmentId query param is required");
    }

    const result = await listAppointmentComments(appointmentId, {
      includeInternal: searchParams.get("includeInternal") === "true",
      page: Number(searchParams.get("page") ?? "1") || 1,
      pageSize: Number(searchParams.get("pageSize") ?? "50") || 50,
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    if (!body?.appointmentId || !body?.body) {
      throw validationError("appointmentId and body are required");
    }

    const authorId = body.authorId ?? session?.userId;
    const authorName = body.authorName ?? session?.name;
    const authorRole = body.authorRole ?? session?.role;
    if (!authorId || !authorName || !authorRole) {
      throw unauthorized(
        "Session or authorId/authorName/authorRole required to add a comment"
      );
    }

    const comment = await addAppointmentComment({
      appointmentId: String(body.appointmentId),
      authorId: String(authorId),
      authorName: String(authorName),
      authorRole,
      body: String(body.body),
      isInternal: Boolean(body.isInternal),
      notifyUserId: body.notifyUserId,
    });
    return jsonOk(comment, 201);
  } catch (error) {
    return jsonError(error);
  }
}
