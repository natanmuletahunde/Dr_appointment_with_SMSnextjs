import Link from "next/link";

import { PatientShell } from "@/components/layout/PatientShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPatient } from "@/lib/actions/patient.actions";

type PageProps = {
  params: { userId: string };
};

export default async function PatientProfilePage({ params }: PageProps) {
  const { userId } = params;
  const patient = await getPatient(userId);

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="My profile"
          description="Personal and clinical information on file."
        />

        {!patient ? (
          <EmptyState
            title="Profile not found"
            description="Complete registration to create your patient record."
            action={{
              label: "Register",
              href: `/patients/${userId}/register`,
            }}
          />
        ) : (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{patient.name}</CardTitle>
              <Button asChild variant="outline" className="shad-gray-btn">
                <Link href={`/patients/${userId}/register`}>Update info</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 text-14-regular sm:grid-cols-2">
              {(
                [
                  ["Email", patient.email],
                  ["Phone", patient.phone],
                  ["Gender", patient.gender],
                  ["Address", patient.address],
                  ["Occupation", patient.occupation],
                  ["Primary physician", patient.primaryPhysician],
                  ["Insurance", patient.insuranceProvider],
                  ["Policy #", patient.insurancePolicyNumber],
                  ["Allergies", patient.allergies || "None listed"],
                  [
                    "Current medication",
                    patient.currentMedication || "None listed",
                  ],
                  [
                    "Emergency contact",
                    `${patient.emergencyContactName || "—"} (${patient.emergencyContactNumber || "—"})`,
                  ],
                ] as Array<[string, string]>
              ).map(([label, value]) => (
                <div key={label}>
                  <p className="text-12-semibold text-dark-600">{label}</p>
                  <p className="text-light-200">{value || "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PatientShell>
  );
}
