import type { LeadStatus } from "@prisma/client";

import type { LeadIngestInput } from "@/lib/leads/types";

const HEADER_ALIASES: Record<string, keyof LeadIngestInput | "status"> = {
  full_name: "fullName",
  fullname: "fullName",
  name: "fullName",
  lead_name: "fullName",
  first_name: "firstName",
  firstname: "firstName",
  last_name: "lastName",
  lastname: "lastName",
  email: "email",
  email_address: "email",
  phone: "phone",
  phone_number: "phone",
  mobile: "phone",
  business_name: "businessName",
  business: "businessName",
  company: "businessName",
  company_name: "businessName",
  source: "source",
  lead_source: "source",
  campaign: "campaign",
  campaign_name: "campaign",
  utm_campaign: "campaign",
  ad_set: "adSet",
  adset: "adSet",
  ad: "ad",
  ad_name: "ad",
  adname: "ad",
  utm_term: "ad",
  created_at: "createdAt",
  createdat: "createdAt",
  date: "createdAt",
  submitted_at: "createdAt",
  timestamp: "createdAt",
  external_id: "externalId",
  externalid: "externalId",
  lead_id: "externalId",
  id: "externalId",
  ghl_contact_id: "ghlContactId",
  contact_id: "ghlContactId",
  owner: "owner",
  assigned_to: "owner",
  notes: "notes",
  note: "notes",
  status: "status",
};

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsvText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

function parseStatus(value: string | undefined): LeadStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  const allowed: LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "UNQUALIFIED",
    "CONVERTED",
    "DUPLICATE",
  ];
  return allowed.includes(normalized as LeadStatus) ? (normalized as LeadStatus) : undefined;
}

function parseDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export type ParsedLeadRow = LeadIngestInput & { status?: LeadStatus };

export function csvRowsToLeads(headers: string[], rows: string[][]): ParsedLeadRow[] {
  const fieldIndexes = headers.map((header) => HEADER_ALIASES[header] ?? null);

  return rows
    .map((row) => {
      const lead: ParsedLeadRow = { metadata: { importSource: "csv" } };
      let firstName: string | undefined;
      let lastName: string | undefined;

      fieldIndexes.forEach((field, index) => {
        const value = row[index]?.trim();
        if (!field || !value) return;

        if (field === "status") {
          lead.status = parseStatus(value);
          return;
        }

        if (field === "firstName") firstName = value;
        if (field === "lastName") lastName = value;
        if (field === "createdAt") {
          const parsed = parseDate(value);
          if (parsed) lead.createdAt = parsed;
          return;
        }

        (lead as Record<string, unknown>)[field] = value;
      });

      if (!lead.fullName && (firstName || lastName)) {
        lead.fullName = [firstName, lastName].filter(Boolean).join(" ");
      }
      if (firstName) lead.firstName = firstName;
      if (lastName) lead.lastName = lastName;

      const hasIdentity =
        lead.email ||
        lead.phone ||
        lead.fullName ||
        lead.businessName ||
        lead.ghlContactId ||
        lead.externalId;

      return hasIdentity ? lead : null;
    })
    .filter((lead): lead is ParsedLeadRow => lead !== null);
}
