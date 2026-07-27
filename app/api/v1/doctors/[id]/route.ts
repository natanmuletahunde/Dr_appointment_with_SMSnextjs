import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import {
  getDoctorById,
  updateDoctorProfile,
} from "@/lib/services/doctor.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const doctor = await getDoctorById(id);
    return jsonOk(doctor);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const patch = await request.json();
    const updated = await updateDoctorProfile(id, patch);
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}
