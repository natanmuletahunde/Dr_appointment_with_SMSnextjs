import React from "react";
import { Card } from "ui-components";

type Patient = {
    id: string;
    name: string;
    email: string;
};

type PatientListProps = {
    patients: Patient[];
};

export function PatientList({ patients }: PatientListProps) {
    return (
        <Card title="Patients">
            <div className="space-y-3">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {patient.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {patient.email}
                            </p>
                        </div>
                        <span className="text-xs text-slate-400">Active</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
