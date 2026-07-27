import { jsonError, jsonOk } from "@/lib/api/http";
import { listDoctors } from "@/lib/services/doctor.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctors = await listDoctors({
      query: searchParams.get("query") ?? undefined,
      specialty: searchParams.get("specialty") ?? undefined,
      activeOnly: searchParams.get("activeOnly") === "true",
      acceptingOnly: searchParams.get("acceptingOnly") === "true",
    });
    return jsonOk({ items: doctors, total: doctors.length });
  } catch (error) {
    return jsonError(error);
  }
}
