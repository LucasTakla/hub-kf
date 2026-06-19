import type { LeadIngestInput } from "@/lib/leads/types";

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
    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
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
    owner: pickString(record.owner, record.assignedTo, record.assigned_to),
    notes: pickString(record.notes, record.note),
    createdAt: pickDate(
      record.createdAt,
      record.created_at,
      record.date,
      record.submittedAt,
      record.submitted_at,
      record.timestamp,
    ),
    metadata: record as Record<string, unknown>,
  };

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
