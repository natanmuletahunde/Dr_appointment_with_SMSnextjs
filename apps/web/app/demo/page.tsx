import { AppointmentDemo } from "feature-appointments";
import { PatientDemo } from "feature-patients";

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-10">
                <AppointmentDemo />
                <PatientDemo />
            </div>
        </main>
    );
}
