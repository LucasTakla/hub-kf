import type { LeadStatus } from "@prisma/client";

import { parseLeadNationality } from "@/lib/leads/nationality";
import { normalizeLeadRevenue } from "@/lib/leads/revenue-labels";
import {
  combineDateAndTime,
  parseLeadDate,
} from "@/lib/leads/parse-values";
import type { LeadIngestInput } from "@/lib/leads/types";

const VALID_STATUSES = new Set<LeadStatus>([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "DUPLICATE",
]);

function pickStatus(...values: unknown[]): LeadStatus | undefined {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const normalized = value.trim().toUpperCase().replace(/\s+/g, "_") as LeadStatus;
    if (VALID_STATUSES.has(normalized)) return normalized;
  }
  return undefined;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function pickDate(...values: unknown[]): Date | null {
  for (const value of values) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === "string") {
      const parsed = parseLeadDate(value);
      if (parsed) return parsed;
    }
  }
  return null;
}

function pickRevenueFields(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;
    const normalized = normalizeLeadRevenue(value);
    if (normalized.monthlyRevenueLabel) return normalized;
  }
  return { monthlyRevenueLabel: null, monthlyRevenue: null };
}

function pickObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function normalizeLeadIngestPayload(body: unknown): LeadIngestInput[] {
  if (Array.isArray(body)) {
    return body.flatMap((item) => normalizeLeadIngestPayload(item));
  }

  if (!body || typeof body !== "object") {
    return [];
  }

  const record = body as Record<string, unknown>;

  if (Array.isArray(record.leads)) {
    return record.leads.flatMap((item) => normalizeLeadIngestPayload(item));
  }

  const contact = pickObject(record.contact) ?? pickObject(record.ghlContact);
  const custom = pickObject(record.customFields) ?? pickObject(record.custom_fields);

  const firstName = pickString(
    record.firstName,
    record.first_name,
    contact?.firstName,
    contact?.first_name,
  );
  const lastName = pickString(
    record.lastName,
    record.last_name,
    contact?.lastName,
    contact?.last_name,
  );
  const fullName = pickString(
    record.fullName,
    record.full_name,
    record.name,
    contact?.name,
    contact?.fullName,
    [firstName, lastName].filter(Boolean).join(" ") || null,
  );

  const email = pickString(
    record.email,
    record.emailAddress,
    record.email_address,
    contact?.email,
  )?.toLowerCase() ?? null;

  const phone = pickString(
    record.phone,
    record.phoneNumber,
    record.phone_number,
    contact?.phone,
  );

  const createdAt = pickDate(
    record.createdAt,
    record.created_at,
    record.date,
    record.submittedAt,
    record.submitted_at,
    record.timestamp,
  );
  const timeRaw = pickString(record.time, record.lead_time, record.submitted_time);
  const combinedCreatedAt = combineDateAndTime(createdAt, timeRaw);

  const revenue = pickRevenueFields(
    record.monthlyRevenueLabel,
    record.monthly_revenue_label,
    record.monthlyRevenue,
    record.monthly_revenue,
    record.monthlyRevenu0e,
    record.revenue,
    record.monthly_rev,
  );

  const normalized: LeadIngestInput = {
    externalId: pickString(record.externalId, record.external_id, record.id, contact?.id),
    ghlContactId: pickString(
      record.ghlContactId,
      record.ghl_contact_id,
      record.contactId,
      record.contact_id,
      contact?.id,
    ),
    firstName,
    lastName,
    fullName,
    email,
    phone,
    businessName: pickString(
      record.businessName,
      record.business_name,
      record.company,
      record.companyName,
      record.company_name,
      custom?.business_name,
      custom?.company,
    ),
    source: pickString(record.source, record.lead_source, record.leadSource, record.utm_source),
    campaign: pickString(record.campaign, record.campaign_name, record.campaignName, record.utm_campaign),
    adSet: pickString(record.adSet, record.ad_set, record.adset, record.utm_content),
    ad: pickString(record.ad, record.ad_name, record.adName, record.utm_term),
    monthlyRevenue: revenue.monthlyRevenue,
    monthlyRevenueLabel: revenue.monthlyRevenueLabel,
    nationality: parseLeadNationality(
      pickString(record.nationality, record.market, record.language, record.lang),
    ),
    owner: pickString(record.owner, record.assignedTo, record.assigned_to),
    notes: pickString(record.notes, record.note),
    createdAt: combinedCreatedAt,
    metadata: record as Record<string, unknown>,
  };

  const status = pickStatus(record.status, record.lead_status, record.leadStatus);
  if (status) normalized.status = status;

  const hasIdentity =
    normalized.email ||
    normalized.phone ||
    normalized.fullName ||
    normalized.businessName ||
    normalized.ghlContactId ||
    normalized.externalId;

  return hasIdentity ? [normalized] : [];
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}
