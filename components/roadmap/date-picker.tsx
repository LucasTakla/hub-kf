"use client";

import { Calendar } from "lucide-react";

import { toDate } from "@/lib/roadmap";

type DatePickerProps = {
  value: Date | string | null | undefined;
  onChange: (value: string | null) => void;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
};

function toInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = toDate(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  required,
  className = "",
}: DatePickerProps) {
  return (
    <div className={`relative ${className}`}>
      <Calendar
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        style={{ color: "var(--text-tertiary)" }}
      />
      <input
        type="date"
        value={toInputValue(value)}
        min={min}
        max={max}
        required={required}
        onChange={(event) => onChange(event.target.value || null)}
        className="w-full rounded-md border py-1.5 pl-8 pr-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[var(--accent)]"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          color: "var(--text-primary)",
          colorScheme: "light dark",
        }}
      />
    </div>
  );
}
