"use client";

import React, { useState } from "react";
import { AppointmentForm } from "./AppointmentForm";
import { AppointmentSummary } from "./AppointmentSummary";
import { SectionTitle } from "ui-components";

type AppointmentItem = {
    patientName: string;
    date: string;
    time: string;
    status: "Booked" | "Rescheduled" | "Canceled";
};

export function AppointmentDemo() {
    const [appointments, setAppointments] = useState<AppointmentItem[]>([
        {
            patientName: "Leah Brooks",
            date: new Date().toISOString(),
            time: "10:30",
            status: "Booked",
        },
    ]);

    const handleAddAppointment = (data: {
        patientName: string;
        date: string;
        time: string;
        reason: string;
    }) => {
        setAppointments((current) => [
            ...current,
            {
                patientName: data.patientName,
                date: data.date,
                time: data.time,
                status: "Booked",
            },
        ]);
    };

    return (
        <div className="space-y-4">
            <SectionTitle
                title="Appointments"
                subtitle="Book and preview upcoming appointments"
            />
            <AppointmentForm onSubmit={handleAddAppointment} />
            <div className="space-y-3">
                {appointments.map((appointment, index) => (
                    <AppointmentSummary key={index} {...appointment} />
                ))}
            </div>
        </div>
    );
}
