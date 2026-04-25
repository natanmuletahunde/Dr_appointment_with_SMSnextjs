import { AppointmentDemo } from "feature-appointments";
import { PatientDemo } from "feature-patients";
import { SectionTitle } from "ui-components";

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-10">
                <SectionTitle
                    title="Feature Demos"
                    subtitle="Appointments and patient management in one place"
                />
                <AppointmentDemo />
                <PatientDemo />
            </div>
        </main>
    );
}
