import Link from "next/link";

import { PatientShell } from "@/components/layout/PatientShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAppointmentsByUser } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

type PageProps = {
  params: { userId: string };
};

export default async function PatientAppointmentsPage({ params }: PageProps) {
  const { userId } = params;
  const appointments = (await getAppointmentsByUser(userId)) as Array<{
    $id: string;
    schedule: string;
    status: string;
    primaryPhysician: string;
    reason: string;
    note?: string;
  }>;

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="My appointments"
          description="History and upcoming visits."
          actions={
            <Button asChild className="shad-primary-btn">
              <Link href={`/patients/${userId}/new-appointment`}>
                Book new
              </Link>
            </Button>
          }
        />

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description="Schedule your first visit with a CarePulse clinician."
            action={{
              label: "Book appointment",
              href: `/patients/${userId}/new-appointment`,
            }}
          />
        ) : (
          <ul className="space-y-3" role="list">
            {appointments.map((appt) => (
              <li
                key={appt.$id}
                className="rounded-2xl border border-dark-400 bg-dark-400 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-16-semibold text-light-200">
                      Dr. {appt.primaryPhysician}
                    </p>
                    <p className="text-14-regular text-dark-700">
                      {formatDateTime(appt.schedule).dateTime}
                    </p>
                    <p className="text-14-regular text-dark-600">{appt.reason}</p>
                    {appt.note ? (
                      <p className="text-12-regular text-dark-600">
                        Note: {appt.note}
                      </p>
                    ) : null}
                  </div>
                  <Badge className="capitalize">{appt.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PatientShell>
  );
}
