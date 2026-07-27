import { PageHeader } from "@/components/shared/PageHeader";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";
import { listWaitlist } from "@/lib/services/waitlist.service";

export default async function AdminWaitlistPage() {
  const entries = await listWaitlist();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <PageHeader
        title="Waitlist"
        description="Patients waiting for an earlier appointment slot. Offer openings as they free up."
      />
      <WaitlistTable entries={entries} showOfferForm />
    </div>
  );
}
