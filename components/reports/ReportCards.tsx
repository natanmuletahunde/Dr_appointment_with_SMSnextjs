import { FileText } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateReportAction } from "@/lib/actions/platform.actions";
import { formatDateTime } from "@/lib/utils";
import type { SavedReport } from "@/lib/services/report.service";

type ReportCardsProps = {
  reports: SavedReport[];
};

const REPORT_OPTIONS = [
  {
    type: "daily_ops",
    title: "Daily operations",
    description: "KPIs for today’s appointment volume, rates, and peaks.",
  },
  {
    type: "doctor_utilization",
    title: "Doctor utilization",
    description: "Share of appointments and scheduled load per physician.",
  },
  {
    type: "cancellation",
    title: "Cancellations",
    description: "Cancellation rates, reasons, and recent cancelled visits.",
  },
] as const;

export function ReportCards({ reports }: ReportCardsProps) {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        {REPORT_OPTIONS.map((opt) => (
          <article
            key={opt.type}
            className="flex flex-col gap-4 rounded-xl border border-dark-500 bg-dark-400 p-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-500">
                <FileText className="size-4" aria-hidden />
                <h2 className="text-16-semibold text-light-200">{opt.title}</h2>
              </div>
              <p className="text-14-regular text-dark-700">{opt.description}</p>
            </div>
            <form action={generateReportAction}>
              <input type="hidden" name="type" value={opt.type} />
              <Button type="submit" className="shad-primary-btn w-full">
                Generate & save
              </Button>
            </form>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-18-bold text-light-200">Saved reports</h2>
        {reports.length === 0 ? (
          <EmptyState
            title="No saved reports yet"
            description="Generate a report above to archive KPIs for later review."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li
                key={report.$id}
                className="rounded-xl border border-dark-500 bg-dark-400 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-16-semibold text-light-200">
                      {report.title}
                    </h3>
                    <p className="text-12-regular text-dark-600 mt-1">
                      By {report.generatedBy} ·{" "}
                      {formatDateTime(report.$createdAt).dateTime}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {report.type.replaceAll("_", " ")}
                  </Badge>
                </div>
                <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-dark-300 p-3 text-12-regular text-dark-700">
                  {JSON.stringify(report.payload, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
