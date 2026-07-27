"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentStatus } from "@/types/domain";

const STATUSES: Array<AppointmentStatus | "all"> = [
  "all",
  "pending",
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
];

type AppointmentFiltersProps = {
  doctors: string[];
  initialQuery?: string;
  initialStatus?: string;
  initialDoctor?: string;
};

export function AppointmentFilters({
  doctors,
  initialQuery = "",
  initialStatus = "all",
  initialDoctor = "all",
}: AppointmentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus || "all");
  const [doctor, setDoctor] = useState(initialDoctor || "all");

  const apply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("query", query.trim());
    else params.delete("query");

    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    if (doctor && doctor !== "all") params.set("doctor", doctor);
    else params.delete("doctor");

    params.delete("page");

    startTransition(() => {
      router.push(`/admin/appointments?${params.toString()}`);
    });
  }, [doctor, query, router, searchParams, status]);

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-2xl border border-dark-400 bg-dark-400 p-4 md:flex-row md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      role="search"
      aria-label="Filter appointments"
    >
      <div className="flex-1 space-y-2">
        <label htmlFor="appt-query" className="shad-input-label">
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-600"
            aria-hidden
          />
          <Input
            id="appt-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Patient, doctor, reason…"
            className="shad-input pl-9"
          />
        </div>
      </div>

      <div className="w-full space-y-2 md:w-48">
        <label htmlFor="appt-status" className="shad-input-label">
          Status
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="appt-status" className="shad-select-trigger">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "all" ? "All statuses" : s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-2 md:w-56">
        <label htmlFor="appt-doctor" className="shad-input-label">
          Doctor
        </label>
        <Select value={doctor} onValueChange={setDoctor}>
          <SelectTrigger id="appt-doctor" className="shad-select-trigger">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            <SelectItem value="all">All doctors</SelectItem>
            {doctors.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="shad-primary-btn md:mb-0.5"
        disabled={pending}
      >
        {pending ? "Filtering…" : "Apply filters"}
      </Button>
    </form>
  );
}
