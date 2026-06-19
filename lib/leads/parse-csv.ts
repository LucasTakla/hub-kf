import type { LeadStatus } from "@prisma/client";

import { parseLeadNationality } from "@/lib/leads/nationality";
import {
  combineDateAndTime,
  parseLeadDate,
  parseMonthlyRevenue,
} from "@/lib/leads/parse-values";
import type { LeadIngestInput } from "@/lib/leads/types";

type CsvField = keyof LeadIngestInput | "status" | "leadTime";

const HEADER_ALIASES: Record<string, CsvField> = {
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
  monthly_revenue: "monthlyRevenue",
  monthlyrevenue: "monthlyRevenue",
  revenue: "monthlyRevenue",
  monthly_rev: "monthlyRevenue",
  gross_monthly_revenue: "monthlyRevenue",
  nationality: "nationality",
  market: "nationality",
  language: "nationality",
  lang: "nationality",
  received_at: "createdAt",
  lead_date: "createdAt",
  time: "leadTime",
  lead_time: "leadTime",
  submitted_time: "leadTime",
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
  return parseLeadDate(value);
}

function parseRevenue(value: string | undefined): number | null {
  return parseMonthlyRevenue(value);
}

export type ParsedLeadRow = LeadIngestInput & { status?: LeadStatus };

export function csvRowsToLeads(headers: string[], rows: string[][]): ParsedLeadRow[] {
  const fieldIndexes = headers.map((header) => HEADER_ALIASES[header] ?? null);

  return rows
    .map((row) => {
      const lead: ParsedLeadRow = { metadata: { importSource: "csv" } };
      let firstName: string | undefined;
      let lastName: string | undefined;
      let dateValue: string | undefined;
      let timeValue: string | undefined;

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
          dateValue = value;
          return;
        }
        if (field === "leadTime") {
          timeValue = value;
          return;
        }

        if (field === "monthlyRevenue") {
          const parsed = parseRevenue(value);
          if (parsed != null) lead.monthlyRevenue = parsed;
          return;
        }

        if (field === "nationality") {
          const parsed = parseLeadNationality(value);
          if (parsed) lead.nationality = parsed;
          return;
        }

        (lead as Record<string, unknown>)[field] = value;
      });

      const combinedDate = combineDateAndTime(
        dateValue ? parseDate(dateValue) : null,
        timeValue,
      );
      if (combinedDate) lead.createdAt = combinedDate;

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
