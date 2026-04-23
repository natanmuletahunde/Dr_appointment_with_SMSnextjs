"use client";

import React, { useState } from "react";
import { PatientRegistrationForm } from "./PatientRegistrationForm";
import { PatientList } from "./PatientList";
import { SectionTitle } from "ui-components";

type PatientItem = {
    id: string;
    name: string;
    email: string;
};

export function PatientDemo() {
    const [patients, setPatients] = useState<PatientItem[]>([
        {
            id: "patient-1",
            name: "Jordan Lee",
            email: "jordan.lee@email.com",
        },
    ]);

    const handleAddPatient = (data: {
        name: string;
        email: string;
        phone: string;
    }) => {
        setPatients((current) => [
            ...current,
            {
                id: `patient-${current.length + 1}`,
                name: data.name,
                email: data.email,
            },
        ]);
    };

    return (
        <div className="space-y-4">
            <SectionTitle
                title="Patients"
                subtitle="Register and review patient records"
            />
            <PatientRegistrationForm onSubmit={handleAddPatient} />
            <PatientList patients={patients} />
        </div>
    );
}
