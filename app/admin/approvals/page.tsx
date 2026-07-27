import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listApprovalsAction,
  reviewApprovalAction,
  submitApprovalAction,
  runPlatformSeedAction,
} from "@/lib/actions/seed.actions";
import { formatDateTime } from "@/lib/utils";

async function seedAction() {
  "use server";
  await runPlatformSeedAction();
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const approvals = await listApprovalsAction(params.status);

  return (
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-8">
        <PageHeader
          title="Approval workflow"
          description="Review operational requests that require admin sign-off before execution."
          actions={
            <form action={seedAction}>
              <Button type="submit" variant="outline" className="border-dark-500">
                Seed demo data
              </Button>
            </form>
          }
        />

        <section className="rounded-xl border border-dark-500 bg-dark-400 p-6">
          <h2 className="text-18-bold mb-4">Submit request</h2>
          <form action={submitApprovalAction} className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              placeholder="Request title"
              required
              className="shad-input"
            />
            <input
              name="resourceId"
              placeholder="Resource id"
              className="shad-input"
              defaultValue="manual"
            />
            <select name="resourceType" className="shad-select-trigger">
              <option value="export">Export</option>
              <option value="schedule_change">Schedule change</option>
              <option value="doctor_leave">Doctor leave</option>
              <option value="appointment">Appointment</option>
            </select>
            <textarea
              name="rationale"
              placeholder="Why is this needed?"
              required
              className="shad-textArea md:col-span-2"
            />
            <Button type="submit" className="shad-primary-btn md:col-span-2">
              Submit for approval
            </Button>
          </form>
        </section>

        {approvals.length === 0 ? (
          <EmptyState
            title="No approval requests"
            description="Submitted requests will appear here for review."
          />
        ) : (
          <div className="space-y-4">
            {approvals.map((item) => (
              <article
                key={item.$id}
                className="rounded-xl border border-dark-500 bg-dark-400 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-16-semibold">{item.title}</h3>
                    <p className="text-14-regular text-dark-700 mt-1">
                      {item.rationale}
                    </p>
                    <p className="text-12-regular text-dark-600 mt-2">
                      By {item.requestedByName} ·{" "}
                      {formatDateTime(item.$createdAt).dateTime}
                    </p>
                  </div>
                  <Badge className="bg-dark-500 text-white">{item.status}</Badge>
                </div>

                {item.status === "submitted" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={reviewApprovalAction}>
                      <input type="hidden" name="requestId" value={item.$id} />
                      <input type="hidden" name="decision" value="approved" />
                      <Button type="submit" className="shad-primary-btn">
                        Approve
                      </Button>
                    </form>
                    <form action={reviewApprovalAction}>
                      <input type="hidden" name="requestId" value={item.$id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <input
                        type="hidden"
                        name="reviewNote"
                        value="Rejected by admin"
                      />
                      <Button type="submit" variant="destructive">
                        Reject
                      </Button>
                    </form>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
  );
}
