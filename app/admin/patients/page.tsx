import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPatients } from "@/lib/actions/patient.actions";

type PageProps = {
  searchParams: { q?: string };
};

export default async function AdminPatientsPage({ searchParams }: PageProps) {
  const q = (searchParams.q ?? "").trim();
  const patients = (q.length >= 2 ? await searchPatients(q, 20) : []) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Patients"
        description="Patient records live in Appwrite. Search below or open the public registration flow."
      />

      <form
        className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        action="/admin/patients"
        method="get"
        role="search"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="shad-input"
          aria-label="Search patients"
          minLength={2}
        />
        <Button type="submit" className="shad-primary-btn">
          Search
        </Button>
      </form>

      {!q ? (
        <EmptyState
          title="Patients come from Appwrite"
          description="Enter at least 2 characters to search registered patients, or send someone to register from the home page."
          action={{ label: "Go to home", href: "/" }}
        />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description={`Nothing matched “${q}”. Try another name or email.`}
          action={{ label: "Clear search", href: "/admin/patients" }}
        />
      ) : (
        <ul className="divide-y divide-dark-500 overflow-hidden rounded-2xl border border-dark-400 bg-dark-400">
          {patients.map(
            (patient: {
              $id: string;
              userId: string;
              name?: string;
              email?: string;
              phone?: string;
            }) => (
              <li
                key={patient.$id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
              >
                <div>
                  <p className="text-16-semibold text-light-200">
                    {patient.name || "Unnamed patient"}
                  </p>
                  <p className="text-14-regular text-dark-700">
                    {patient.email || "No email"} · {patient.phone || "No phone"}
                  </p>
                </div>
                <Button asChild variant="outline" className="shad-gray-btn">
                  <Link href={`/patients/${patient.userId}/dashboard`}>
                    Open portal
                  </Link>
                </Button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
