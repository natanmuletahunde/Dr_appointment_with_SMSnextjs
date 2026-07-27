import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AppointmentRecord, ExportColumn } from "@/types/domain";
import { formatDateTime } from "@/lib/utils";

export const APPOINTMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "$id", header: "Appointment ID" },
  { key: "patientName", header: "Patient" },
  { key: "primaryPhysician", header: "Doctor" },
  { key: "schedule", header: "Schedule" },
  { key: "status", header: "Status" },
  { key: "reason", header: "Reason" },
  { key: "note", header: "Note" },
  { key: "cancellationReason", header: "Cancellation Reason" },
];

function rowsFromAppointments(appointments: AppointmentRecord[]) {
  return appointments.map((a) => ({
    $id: a.$id,
    patientName: a.patientName,
    primaryPhysician: a.primaryPhysician,
    schedule: formatDateTime(a.schedule).dateTime,
    status: a.status,
    reason: a.reason,
    note: a.note ?? "",
    cancellationReason: a.cancellationReason ?? "",
  }));
}

export function exportAppointmentsToExcel(
  appointments: AppointmentRecord[]
): Buffer {
  const rows = rowsFromAppointments(appointments);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
  const out = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(out);
}

export function exportAppointmentsToPdf(
  appointments: AppointmentRecord[],
  title = "CarePulse Appointments Report"
): Buffer {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

  const rows = rowsFromAppointments(appointments).map((r) =>
    APPOINTMENT_EXPORT_COLUMNS.map((c) => String((r as Record<string, string>)[c.key] ?? ""))
  );

  autoTable(doc, {
    startY: 28,
    head: [APPOINTMENT_EXPORT_COLUMNS.map((c) => c.header)],
    body: rows,
    styles: { fontSize: 8 },
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export function exportAppointmentsToCsv(
  appointments: AppointmentRecord[]
): string {
  const rows = rowsFromAppointments(appointments);
  const headers = APPOINTMENT_EXPORT_COLUMNS.map((c) => c.header);
  const keys = APPOINTMENT_EXPORT_COLUMNS.map((c) => c.key);
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) =>
      keys.map((k) => escape(String((row as Record<string, string>)[k] ?? ""))).join(",")
    ),
  ];
  return lines.join("\n");
}
