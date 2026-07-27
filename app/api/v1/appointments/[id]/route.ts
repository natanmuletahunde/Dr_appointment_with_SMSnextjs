import { jsonError, jsonOk } from "@/lib/api/http";
import { notFound } from "@/lib/errors";
import { getDocument } from "@/lib/persistence/document-store";
import type { AppointmentRecord } from "@/types/domain";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    try {
      const { getAppointment } = await import(
        "@/lib/actions/appointment.actions"
      );
      const appointment = await getAppointment(id);
      if (appointment) return jsonOk(appointment);
    } catch {
      // Fall through to local mirror
    }

    const mirrored = (await getDocument(
      "appointment_mirror",
      id
    )) as unknown as AppointmentRecord | null;
    if (!mirrored) throw notFound("Appointment not found");
    return jsonOk(mirrored);
  } catch (error) {
    return jsonError(error);
  }
}
