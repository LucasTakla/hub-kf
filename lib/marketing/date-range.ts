import type { DateRange } from "@/lib/marketing/types";

export const MARKETING_DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "custom", label: "Custom Range" },
];

export function getDateRangeLabel(range: DateRange): string {
  return MARKETING_DATE_RANGES.find((item) => item.id === range)?.label ?? "Last 30 Days";
}
