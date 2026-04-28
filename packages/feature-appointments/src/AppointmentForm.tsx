"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "ui-components";
import { formatDate } from "utils";

type AppointmentFormProps = {
    onSubmit?: (data: {
        patientName: string;
        date: string;
        time: string;
        reason: string;
    }) => void;
};

export function AppointmentForm({ onSubmit }: AppointmentFormProps) {
    const [patientName, setPatientName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");

    const previewDate = date ? formatDate(date) : "Pick a date";

    return (
        <Card title="Book appointment">
            <form
                className="space-y-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit?.({ patientName, date, time, reason });
                    setReason("");
                }}
            >
                <Input
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="Patient name"
                    required
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                    />
                    <Input
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        required
                    />
                </div>
                <Input
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Reason for visit"
                    required
                />
                <div className="text-xs text-slate-500">
                    Preview: {previewDate} at {time || "--:--"}
                </div>
                <Button type="submit">Confirm</Button>
            </form>
        </Card>
    );
}
