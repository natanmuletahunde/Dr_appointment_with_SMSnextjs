import { notFound } from "next/navigation";

import { AppointmentDetailPanel } from "@/components/appointments/AppointmentDetailPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { listActivityTimeline } from "@/lib/services/activity.service";
import { searchAppointments } from "@/lib/services/appointment-catalog.service";
import { listAppointmentComments } from "@/lib/services/comment.service";
import { getAppointment } from "@/lib/actions/appointment.actions";
import type { AppointmentRecord } from "@/types/domain";

type PageProps = {
  params: { id: string };
};

async function resolveAppointment(id: string): Promise<AppointmentRecord | null> {
  const mirrored = await searchAppointments({ query: id, pageSize: 5 });
  const exact = mirrored.items.find((a) => a.$id === id);
  if (exact) return exact;

  const fromAppwrite = await getAppointment(id);
  if (!fromAppwrite) return null;

  return {
    $id: fromAppwrite.$id,
    $createdAt: fromAppwrite.$createdAt,
    $updatedAt: fromAppwrite.$updatedAt,
    userId: fromAppwrite.userId,
    patientId:
      typeof fromAppwrite.patient === "string"
        ? fromAppwrite.patient
        : fromAppwrite.patient?.$id ?? "",
    patientName:
      typeof fromAppwrite.patient === "object" && fromAppwrite.patient?.name
        ? fromAppwrite.patient.name
        : "Patient",
    primaryPhysician: fromAppwrite.primaryPhysician,
    reason: fromAppwrite.reason,
    note: fromAppwrite.note,
    schedule: new Date(fromAppwrite.schedule).toISOString(),
    status: fromAppwrite.status,
    cancellationReason: fromAppwrite.cancellationReason,
    durationMinutes: 30,
  } as AppointmentRecord;
}

export default async function AdminAppointmentDetailPage({ params }: PageProps) {
  const appointment = await resolveAppointment(params.id);
  if (!appointment) notFound();

  const [commentsResult, timelineResult] = await Promise.all([
    listAppointmentComments(appointment.$id, { includeInternal: true }),
    listActivityTimeline("appointment", appointment.$id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Appointment detail"
        description={`Managing visit for ${appointment.patientName}`}
      />
      <AppointmentDetailPanel
        appointment={appointment}
        comments={commentsResult.items}
        timeline={timelineResult.items}
      />
    </div>
  );
}
