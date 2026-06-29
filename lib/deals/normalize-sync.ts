import type { DealPriority, DealStage } from "@prisma/client";

import { mapGhlStageToDealStage } from "@/lib/deals/stage-map";
import type { DealSyncAction, DealSyncInput } from "@/lib/deals/types";

const VALID_PRIORITIES = new Set<DealPriority>(["HIGH", "MEDIUM", "LOW"]);

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickPriority(...values: unknown[]): DealPriority | undefined {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const normalized = value.trim().toUpperCase() as DealPriority;
    if (VALID_PRIORITIES.has(normalized)) return normalized;
  }
  return undefined;
}

function pickStage(...values: unknown[]): DealStage | undefined {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const fromGhl = mapGhlStageToDealStage(value);
    if (fromGhl) return fromGhl;

    const normalized = value.trim().toUpperCase().replace(/-/g, "_") as DealStage;
    const allowed: DealStage[] = [
      "NEW",
      "QUALIFIED",
      "COLLECTING_DOCS",
      "READY_TO_SUBMIT",
      "SUBMITTED",
      "OFFERS_RECEIVED",
      "NEGOTIATING",
      "FUNDED",
      "LOST",
    ];
    if (allowed.includes(normalized)) return normalized;
  }
  return undefined;
}

function pickAction(value: unknown): DealSyncAction | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  if (normalized === "opportunity-created" || normalized === "opportunity.created") {
    return "opportunity-created";
  }
  if (normalized === "stage-changed" || normalized === "stage.changed") {
    return "stage-changed";
  }
  return undefined;
}

export function normalizeDealSyncPayload(body: unknown): DealSyncInput[] {
  if (Array.isArray(body)) {
    return body.flatMap((item) => normalizeDealSyncPayload(item));
  }

  if (!body || typeof body !== "object") {
    return [];
  }

  const record = body as Record<string, unknown>;

  if (Array.isArray(record.deals)) {
    return record.deals.flatMap((item) => normalizeDealSyncPayload(item));
  }
  if (Array.isArray(record.opportunities)) {
    return record.opportunities.flatMap((item) => normalizeDealSyncPayload(item));
  }

  const opportunity = pickObject(record.opportunity) ?? pickObject(record.opp);
  const contact = pickObject(record.contact) ?? pickObject(record.ghlContact);

  const ghlOpportunityId = pickString(
    record.ghlOpportunityId,
    record.ghl_opportunity_id,
    record.opportunityId,
    record.opportunity_id,
    record.id,
    opportunity?.id,
  );

  if (!ghlOpportunityId) {
    return [];
  }

  const ghlStageName = pickString(
    record.ghlStageName,
    record.ghl_stage_name,
    record.stage,
    record.stageName,
    record.stage_name,
    record.pipelineStage,
    record.pipeline_stage,
    record.status,
    opportunity?.stage,
    opportunity?.pipelineStage,
    opportunity?.pipeline_stage,
    opportunity?.status,
  );

  const stage = pickStage(
    record.stage,
    record.stageName,
    record.pipelineStage,
    record.pipeline_stage,
    record.status,
    ghlStageName,
    opportunity?.stage,
    opportunity?.pipelineStage,
    opportunity?.status,
  );

  const contactFirst = pickString(contact?.firstName, contact?.first_name);
  const contactLast = pickString(contact?.lastName, contact?.last_name);
  const contactFull = pickString(
    record.contactName,
    record.contact_name,
    contact?.name,
    contact?.fullName,
    [contactFirst, contactLast].filter(Boolean).join(" ") || null,
  );

  const businessName = pickString(
    record.businessName,
    record.business_name,
    record.company,
    record.companyName,
    record.company_name,
    record.name,
    record.title,
    opportunity?.name,
    opportunity?.title,
    contactFull,
  );

  const normalized: DealSyncInput = {
    action: pickAction(record.action) ?? pickAction(record.event) ?? pickAction(record.type),
    ghlOpportunityId,
    ghlContactId: pickString(
      record.ghlContactId,
      record.ghl_contact_id,
      record.contactId,
      record.contact_id,
      contact?.id,
    ),
    ghlStageName,
    businessName,
    fundingAmount: pickNumber(
      record.fundingAmount,
      record.funding_amount,
      record.monetaryValue,
      record.monetary_value,
      record.amount,
      record.value,
      opportunity?.monetaryValue,
      opportunity?.monetary_value,
    ),
    fundedAmount: pickNumber(record.fundedAmount, record.funded_amount),
    owner: pickString(
      record.owner,
      record.assignedTo,
      record.assigned_to,
      record.assignedUser,
      opportunity?.assignedTo,
      opportunity?.assigned_to,
    ),
    stage,
    priority: pickPriority(record.priority),
    lastActivity: pickString(record.lastActivity, record.last_activity),
    industry: pickString(record.industry),
    annualRevenue: pickNumber(record.annualRevenue, record.annual_revenue),
    contactName: contactFull,
    contactEmail: pickString(record.contactEmail, record.contact_email, record.email, contact?.email)?.toLowerCase() ?? null,
    contactPhone: pickString(record.contactPhone, record.contact_phone, record.phone, contact?.phone),
    source: pickString(record.source, record.leadSource, record.lead_source),
    internalNotes: pickString(record.internalNotes, record.internal_notes, record.notes),
    metadata: record as Record<string, unknown>,
  };

  return [normalized];
}
