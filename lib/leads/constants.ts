import type { LeadStatus } from "@prisma/client";

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "UNQUALIFIED", label: "Unqualified" },
  { id: "CONVERTED", label: "Converted" },
  { id: "DUPLICATE", label: "Duplicate" },
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  UNQUALIFIED: "Unqualified",
  CONVERTED: "Converted",
  DUPLICATE: "Duplicate",
};
