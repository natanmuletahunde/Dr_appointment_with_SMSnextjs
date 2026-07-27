import { PatientShell } from "@/components/layout/PatientShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlistAction } from "@/lib/actions/platform.actions";
import { listDoctors } from "@/lib/services/doctor.service";
import { listWaitlist } from "@/lib/services/waitlist.service";

type PageProps = {
  params: { userId: string };
};

export default async function PatientWaitlistPage({ params }: PageProps) {
  const { userId } = params;
  const [entries, doctors] = await Promise.all([
    listWaitlist({ userId }),
    listDoctors({ activeOnly: true }),
  ]);

  return (
    <PatientShell userId={userId}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Waitlist"
          description="Request an earlier appointment if your preferred doctor has no open slots."
        />

        <section className="rounded-xl border border-dark-500 bg-dark-400 p-6">
          <h2 className="text-18-bold mb-4 text-light-200">Join waitlist</h2>
          <form action={joinWaitlistAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="userId" value={userId} />
            <Input
              name="patientName"
              placeholder="Your full name"
              required
              className="shad-input"
              aria-label="Patient name"
            />
            <Input
              name="patientEmail"
              type="email"
              placeholder="Email (optional)"
              className="shad-input"
              aria-label="Email"
            />
            <Input
              name="patientPhone"
              placeholder="Phone (optional)"
              className="shad-input"
              aria-label="Phone"
            />
            <select
              name="preferredDoctor"
              required
              className="shad-select-trigger"
              aria-label="Preferred doctor"
              defaultValue=""
            >
              <option value="" disabled>
                Preferred doctor
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.$id} value={doctor.name}>
                  Dr. {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </select>
            <Input
              name="earliestDate"
              type="date"
              required
              className="shad-input"
              aria-label="Earliest date"
            />
            <Input
              name="latestDate"
              type="date"
              required
              className="shad-input"
              aria-label="Latest date"
            />
            <Input
              name="preferredDays"
              placeholder="Preferred weekdays (0=Sun…6=Sat, comma-separated)"
              className="shad-input md:col-span-2"
              aria-label="Preferred days"
            />
            <textarea
              name="reason"
              placeholder="Why do you need an earlier slot?"
              required
              className="shad-textArea md:col-span-2"
              aria-label="Reason"
            />
            <textarea
              name="notes"
              placeholder="Additional notes (optional)"
              className="shad-textArea md:col-span-2"
              aria-label="Notes"
            />
            <Button type="submit" className="shad-primary-btn md:col-span-2">
              Join waitlist
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-18-bold text-light-200">My waitlist entries</h2>
          <WaitlistTable entries={entries} />
        </section>
      </div>
    </PatientShell>
  );
}
