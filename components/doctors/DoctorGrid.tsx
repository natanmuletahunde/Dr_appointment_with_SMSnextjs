import { EmptyState } from "@/components/shared/EmptyState";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import type { DoctorProfile } from "@/types/domain";

type DoctorGridProps = {
  doctors: DoctorProfile[];
};

export function DoctorGrid({ doctors }: DoctorGridProps) {
  if (doctors.length === 0) {
    return (
      <EmptyState
        title="No doctors found"
        description="Seeded doctor profiles will appear here once available."
      />
    );
  }

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.$id} doctor={doctor} />
      ))}
    </div>
  );
}
