"use client";

import { Calendar } from "lucide-react";

import { MARKETING_DATE_RANGES } from "@/lib/marketing/date-range";
import type { DateRange } from "@/lib/marketing/types";

type MarketingDateRangeBarProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function MarketingDateRangeBar({ value, onChange }: MarketingDateRangeBarProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-4 py-2"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <Calendar className="mr-1 h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
      {MARKETING_DATE_RANGES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          disabled={id === "custom"}
          className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
          style={{
            background: value === id ? "var(--accent-subtle)" : "var(--bg-muted)",
            color: value === id ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
