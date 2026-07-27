import Link from "next/link";

import { PatientShell } from "@/components/layout/PatientShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAppointmentsByUser } from "@/lib/actions/appointment.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { listNotifications } from "@/lib/services/notification.service";
import { formatDateTime } from "@/lib/utils";

type PageProps = {
  params: { userId: string };
};

export default async function PatientDashboardPage({ params }: PageProps) {
  const { userId } = params;
  const [patient, appointments, notifications] = await Promise.all([
    getPatient(userId),
    getAppointmentsByUser(userId),
    listNotifications(userId, { pageSize: 5 }),
  ]);

  const upcoming = (appointments as Array<{
    $id: string;
    schedule: string;
    status: string;
    primaryPhysician: string;
    reason: string;
  }>)
    .filter((a) => a.status !== "cancelled")
    .slice(0, 3);

  const unread = notifications.items.filter((n) => !n.read).length;

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title={`Hello${patient?.name ? `, ${patient.name}` : ""}`}
          description="Your CarePulse patient portal overview."
          actions={
            <Button asChild className="shad-primary-btn">
              <Link href={`/patients/${userId}/new-appointment`}>
                Book appointment
              </Link>
            </Button>
          }
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming</CardDescription>
              <CardTitle className="text-32-bold text-green-500">
                {upcoming.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unread alerts</CardDescription>
              <CardTitle className="text-32-bold text-green-500">
                {unread}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Primary physician</CardDescription>
              <CardTitle className="text-18-bold">
                {patient?.primaryPhysician || "Not set"}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-18-bold text-light-200">Next appointments</h2>
            <Link
              href={`/patients/${userId}/appointments`}
              className="text-14-medium text-green-500 hover:underline"
            >
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming visits"
              description="Book a visit when you're ready."
              action={{
                label: "New appointment",
                href: `/patients/${userId}/new-appointment`,
              }}
            />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((appt) => (
                <li
                  key={appt.$id}
                  className="rounded-2xl border border-dark-400 bg-dark-400 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-16-semibold text-light-200">
                        Dr. {appt.primaryPhysician}
                      </p>
                      <p className="text-14-regular text-dark-700">
                        {formatDateTime(appt.schedule).dateTime}
                      </p>
                      <p className="text-14-regular text-dark-600">
                        {appt.reason}
                      </p>
                    </div>
                    <Badge className="capitalize">{appt.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="shad-gray-btn">
              <Link href={`/patients/${userId}/profile`}>Profile</Link>
            </Button>
            <Button asChild variant="outline" className="shad-gray-btn">
              <Link href={`/patients/${userId}/notifications`}>
                Notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PatientShell>
  );
}
