import Link from "next/link";
import { Activity, Bell, CalendarDays, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { GlobalSearchResult } from "@/lib/services/search.service";

type GlobalSearchResultsProps = {
  query: string;
  results: GlobalSearchResult;
};

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-green-500">{icon}</span>
      <h2 className="text-18-bold text-light-200">{title}</h2>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}

export function GlobalSearchResults({
  query,
  results,
}: GlobalSearchResultsProps) {
  const total =
    results.appointments.length +
    results.doctors.length +
    results.audit.length +
    results.notifications.length;

  if (!query.trim()) {
    return (
      <EmptyState
        title="Search CarePulse"
        description="Enter a patient name, doctor, appointment id, audit summary, or notification text."
      />
    );
  }

  if (total === 0) {
    return (
      <EmptyState
        title="No matches"
        description={`Nothing matched “${query}”. Try another term.`}
        action={{ label: "Clear search", href: "/admin/search" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-14-regular text-dark-700">
        {total} result{total === 1 ? "" : "s"} for “{query}”
      </p>

      {results.appointments.length > 0 ? (
        <section>
          <SectionHeader
            icon={<CalendarDays className="size-4" aria-hidden />}
            title="Appointments"
            count={results.appointments.length}
          />
          <ul className="divide-y divide-dark-500 overflow-hidden rounded-2xl border border-dark-400 bg-dark-400">
            {results.appointments.map((appt) => (
              <li key={appt.$id}>
                <Link
                  href={`/admin/appointments/${appt.$id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-dark-500/40"
                >
                  <div>
                    <p className="text-16-semibold text-light-200">
                      {appt.patientName}
                    </p>
                    <p className="text-14-regular text-dark-700">
                      Dr. {appt.primaryPhysician} · {appt.reason}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {appt.status.replaceAll("_", " ")}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.doctors.length > 0 ? (
        <section>
          <SectionHeader
            icon={<Stethoscope className="size-4" aria-hidden />}
            title="Doctors"
            count={results.doctors.length}
          />
          <ul className="divide-y divide-dark-500 overflow-hidden rounded-2xl border border-dark-400 bg-dark-400">
            {results.doctors.map((doctor) => (
              <li key={doctor.$id}>
                <Link
                  href={`/admin/doctors/${doctor.$id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-dark-500/40"
                >
                  <div>
                    <p className="text-16-semibold text-light-200">
                      Dr. {doctor.name}
                    </p>
                    <p className="text-14-regular text-dark-700">
                      {doctor.specialty}
                    </p>
                  </div>
                  <Badge
                    variant={doctor.isActive ? "success" : "secondary"}
                  >
                    {doctor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.audit.length > 0 ? (
        <section>
          <SectionHeader
            icon={<Activity className="size-4" aria-hidden />}
            title="Audit log"
            count={results.audit.length}
          />
          <ul className="divide-y divide-dark-500 overflow-hidden rounded-2xl border border-dark-400 bg-dark-400">
            {results.audit.map((entry) => (
              <li key={entry.$id} className="px-4 py-4">
                <p className="text-16-semibold text-light-200">
                  {entry.summary}
                </p>
                <p className="text-14-regular text-dark-700">
                  {entry.action} · {entry.resourceType}/{entry.resourceId} ·{" "}
                  {formatDateTime(entry.$createdAt).dateTime}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.notifications.length > 0 ? (
        <section>
          <SectionHeader
            icon={<Bell className="size-4" aria-hidden />}
            title="Notifications"
            count={results.notifications.length}
          />
          <ul className="divide-y divide-dark-500 overflow-hidden rounded-2xl border border-dark-400 bg-dark-400">
            {results.notifications.map((n) => (
              <li key={n.$id} className="px-4 py-4">
                <p className="text-16-semibold text-light-200">{n.title}</p>
                <p className="text-14-regular text-dark-700">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
