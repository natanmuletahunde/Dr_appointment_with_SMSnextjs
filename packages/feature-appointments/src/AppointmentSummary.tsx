import React from "react";
import { Card } from "ui-components";
import { formatDate } from "utils";

type AppointmentSummaryProps = {
    patientName: string;
    date: string;
    time: string;
    status: "Booked" | "Rescheduled" | "Canceled";
};

export function AppointmentSummary({
    patientName,
    date,
    time,
    status,
}: AppointmentSummaryProps) {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{patientName}</p>
                    <p className="text-base font-semibold">
                        {formatDate(date)} at {time}
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {status}
                </span>
            </div>
        </Card>
    );
}
