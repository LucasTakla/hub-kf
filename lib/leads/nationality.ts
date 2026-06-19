import type { LeadNationality } from "@prisma/client";

export const LEAD_NATIONALITIES: {
  id: LeadNationality;
  label: string;
  description: string;
}[] = [
  { id: "PT", label: "PT", description: "Portuguese market" },
  { id: "ES", label: "ES", description: "Spanish market" },
  { id: "EN", label: "EN", description: "English market" },
];

export const LEAD_NATIONALITY_LABELS: Record<LeadNationality, string> = {
  PT: "Portuguese",
  ES: "Spanish",
  EN: "English",
};

export function parseLeadNationality(value: unknown): LeadNationality | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "PT":
    case "PORTUGUESE":
    case "PORTUGAL":
      return "PT";
    case "ES":
    case "SPANISH":
    case "SPAIN":
    case "ESP":
      return "ES";
    case "EN":
    case "ENGLISH":
    case "ENG":
      return "EN";
    default:
      return null;
  }
}
