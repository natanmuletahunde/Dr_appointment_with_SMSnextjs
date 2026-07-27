import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAvailableSlots,
  getDoctorById,
} from "@/lib/services/doctor.service";
import { formatDateTime } from "@/lib/utils";

type PageProps = {
  params: { id: string };
};

export default async function AdminDoctorDetailPage({ params }: PageProps) {
  let doctor;
  try {
    doctor = await getDoctorById(params.id);
  } catch {
    notFound();
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const slots = await getAvailableSlots({
    doctorIdOrName: doctor.$id,
    date: today,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title={`Dr. ${doctor.name}`}
        description={doctor.specialty}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-dark-500">
              <Image
                src={doctor.imageUrl || "/assets/images/dr-green.png"}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {doctor.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {doctor.acceptingNewPatients ? (
                  <Badge variant="outline">Accepting patients</Badge>
                ) : null}
              </div>
              <CardDescription>{doctor.bio}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-14-regular sm:grid-cols-2">
            <div>
              <p className="text-12-semibold text-dark-600">Email</p>
              <p className="text-light-200">{doctor.email}</p>
            </div>
            <div>
              <p className="text-12-semibold text-dark-600">Phone</p>
              <p className="text-light-200">{doctor.phone}</p>
            </div>
            <div>
              <p className="text-12-semibold text-dark-600">Experience</p>
              <p className="text-light-200">{doctor.yearsExperience} years</p>
            </div>
            <div>
              <p className="text-12-semibold text-dark-600">Room</p>
              <p className="text-light-200">{doctor.roomNumber || "—"}</p>
            </div>
            <div>
              <p className="text-12-semibold text-dark-600">Hours</p>
              <p className="text-light-200">
                {doctor.startTime} – {doctor.endTime} ({doctor.slotMinutes}m)
              </p>
            </div>
            <div>
              <p className="text-12-semibold text-dark-600">Languages</p>
              <p className="text-light-200">{doctor.languages.join(", ")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability today</CardTitle>
            <CardDescription>
              Slots for {today} · {slots.filter((s) => s.available).length} open
            </CardDescription>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-14-regular text-dark-600">
                No slots available for today (day off or fully blocked).
              </p>
            ) : (
              <ul className="grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">
                {slots.map((slot) => (
                  <li
                    key={slot.start}
                    className={`rounded-lg border px-3 py-2 text-14-regular ${
                      slot.available
                        ? "border-green-500/40 bg-green-500/10 text-green-500"
                        : "border-dark-500 bg-dark-300 text-dark-600"
                    }`}
                  >
                    {formatDateTime(slot.start).timeOnly} –{" "}
                    {formatDateTime(slot.end).timeOnly}
                    {!slot.available && slot.reason
                      ? ` · ${slot.reason}`
                      : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
