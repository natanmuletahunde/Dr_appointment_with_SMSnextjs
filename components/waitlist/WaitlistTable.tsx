import { ListOrdered } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { offerWaitlistAction } from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type {
  WaitlistEntry,
  WaitlistStatus,
} from "@/lib/services/waitlist.service";

const STATUS_VARIANT: Record<
  WaitlistStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "outline"
> = {
  waiting: "warning",
  offered: "success",
  booked: "default",
  expired: "secondary",
  cancelled: "destructive",
};

type WaitlistTableProps = {
  entries: WaitlistEntry[];
  showOfferForm?: boolean;
};

export function WaitlistTable({
  entries,
  showOfferForm = false,
}: WaitlistTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Waitlist is empty"
        description="Patients who request an earlier slot will appear here."
        icon={<ListOrdered className="size-6" aria-hidden />}
      />
    );
  }

  return (
    <div className="data-table">
      <Table className="shad-table">
        <TableHeader className="bg-dark-200">
          <TableRow className="shad-table-row-header">
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            {showOfferForm ? <TableHead>Offer slot</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.$id} className="shad-table-row">
              <TableCell>
                <div>
                  <p className="text-14-medium text-light-200">
                    {entry.patientName}
                  </p>
                  <p className="text-12-regular text-dark-600">
                    {entry.patientEmail || entry.userId}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-14-regular">
                Dr. {entry.preferredDoctor}
              </TableCell>
              <TableCell className="text-14-regular whitespace-nowrap">
                {entry.earliestDate} → {entry.latestDate}
              </TableCell>
              <TableCell className="max-w-xs text-14-regular">
                {entry.reason}
                {entry.offeredSlot ? (
                  <p className="text-12-regular text-green-500 mt-1">
                    Offered: {formatDateTime(entry.offeredSlot).dateTime}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge
                  variant={STATUS_VARIANT[entry.status]}
                  className="capitalize"
                >
                  {entry.status}
                </Badge>
              </TableCell>
              {showOfferForm ? (
                <TableCell>
                  {entry.status === "waiting" ? (
                    <form
                      action={offerWaitlistAction}
                      className="flex min-w-[220px] flex-col gap-2"
                    >
                      <input type="hidden" name="entryId" value={entry.$id} />
                      <Input
                        name="offeredSlot"
                        type="datetime-local"
                        required
                        className="shad-input"
                        aria-label={`Offer slot for ${entry.patientName}`}
                      />
                      <Button type="submit" size="sm" className="shad-primary-btn">
                        Offer
                      </Button>
                    </form>
                  ) : (
                    <span className="text-12-regular text-dark-600">—</span>
                  )}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
