import { jsonError, jsonOk } from "@/lib/api/http";
import { validationError } from "@/lib/errors";
import { getAvailableSlots } from "@/lib/services/doctor.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw validationError("date query param is required as YYYY-MM-DD");
    }

    const bookedParam = searchParams.get("booked");
    const bookedIsoTimes = bookedParam
      ? bookedParam.split(",").filter(Boolean)
      : undefined;

    const slots = await getAvailableSlots({
      doctorIdOrName: id,
      date,
      bookedIsoTimes,
    });
    return jsonOk({ date, doctorId: id, slots });
  } catch (error) {
    return jsonError(error);
  }
}
