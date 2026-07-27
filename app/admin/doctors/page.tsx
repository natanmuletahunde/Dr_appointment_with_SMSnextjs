import { DoctorGrid } from "@/components/doctors/DoctorGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { listDoctors } from "@/lib/services/doctor.service";

export default async function AdminDoctorsPage() {
  const doctors = await listDoctors({ activeOnly: false });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Doctors"
        description={`${doctors.length} clinician profiles in the care network.`}
      />
      <DoctorGrid doctors={doctors} />
    </div>
  );
}
