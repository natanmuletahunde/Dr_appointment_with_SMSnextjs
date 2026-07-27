import { jsonError, jsonOk, requireAdmin } from "@/lib/api/http";
import {
  getClinicSettings,
  updateClinicSettings,
} from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getClinicSettings();
    return jsonOk(settings);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const patch = await request.json();
    const updated = await updateClinicSettings(patch);
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}
