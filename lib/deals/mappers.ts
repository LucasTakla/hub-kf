import type {
  ApplicationStatus as DbApplicationStatus,
  DealApplication,
  DealOffer,
  DealPriority as DbDealPriority,
  DealStage as DbDealStage,
  Deal as DbDeal,
  OfferStatus as DbOfferStatus,
} from "@prisma/client";

import type {
  ApplicationStatus,
  Deal,
  DealApplication as ClientDealApplication,
  DealOffer as ClientDealOffer,
  DealPriority,
  DealStage,
  OfferStatus,
} from "@/lib/sales/types";

type DealWithRelations = DbDeal & {
  applications: DealApplication[];
  offers: DealOffer[];
};

const STAGE_TO_CLIENT: Record<DbDealStage, DealStage> = {
  NEW: "new",
  QUALIFIED: "qualified",
  COLLECTING_DOCS: "collecting-docs",
  READY_TO_SUBMIT: "ready-to-submit",
  SUBMITTED: "submitted",
  OFFERS_RECEIVED: "offers-received",
  NEGOTIATING: "negotiating",
  FUNDED: "funded",
  LOST: "lost",
};

const STAGE_TO_DB: Record<DealStage, DbDealStage> = Object.fromEntries(
  Object.entries(STAGE_TO_CLIENT).map(([db, client]) => [client, db]),
) as Record<DealStage, DbDealStage>;

const PRIORITY_TO_CLIENT: Record<DbDealPriority, DealPriority> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const APP_STATUS_TO_CLIENT: Record<DbApplicationStatus, ApplicationStatus> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under-review",
  APPROVED: "approved",
  DECLINED: "declined",
};

export const APP_STATUS_TO_DB: Record<ApplicationStatus, DbApplicationStatus> = Object.fromEntries(
  Object.entries(APP_STATUS_TO_CLIENT).map(([db, client]) => [client, db]),
) as Record<ApplicationStatus, DbApplicationStatus>;

const OFFER_STATUS_TO_CLIENT: Record<DbOfferStatus, OfferStatus> = {
  RECEIVED: "received",
  PRESENTED: "presented",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
};

export const OFFER_STATUS_TO_DB: Record<OfferStatus, DbOfferStatus> = Object.fromEntries(
  Object.entries(OFFER_STATUS_TO_CLIENT).map(([db, client]) => [client, db]),
) as Record<OfferStatus, DbOfferStatus>;

function formatDateOnly(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function daysInStage(stageEnteredAt: Date): number {
  return Math.max(
    0,
    Math.floor((Date.now() - stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function responseDays(submissionDate: Date | null, status: DbApplicationStatus): number | null {
  if (!submissionDate || status === "DRAFT") return null;
  return Math.max(
    0,
    Math.floor((Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function mapApplication(app: DealApplication): ClientDealApplication {
  return {
    id: app.id,
    lender: app.lender,
    submissionDate: formatDateOnly(app.submissionDate),
    status: APP_STATUS_TO_CLIENT[app.status],
    notes: app.notes ?? undefined,
    assignedUser: app.assignedUser ?? "Unassigned",
    responseDays: responseDays(app.submissionDate, app.status),
  };
}

function mapOffer(offer: DealOffer): ClientDealOffer {
  return {
    id: offer.id,
    lender: offer.lender,
    amount: offer.amount,
    factorRate: offer.factorRate ?? 0,
    term: offer.term ?? "—",
    paymentFrequency: offer.paymentFrequency ?? "—",
    status: OFFER_STATUS_TO_CLIENT[offer.status],
    expirationDate: formatDateOnly(offer.expirationDate) ?? "—",
    dailyPayment: offer.dailyPayment ?? undefined,
  };
}

export function mapDealToClient(deal: DealWithRelations): Deal {
  return {
    id: deal.id,
    businessName: deal.businessName,
    fundingAmount: deal.fundingAmount,
    owner: deal.owner ?? "Unassigned",
    stage: STAGE_TO_CLIENT[deal.stage],
    daysInStage: daysInStage(deal.stageEnteredAt),
    priority: PRIORITY_TO_CLIENT[deal.priority],
    lastActivity: deal.lastActivity ?? deal.ghlStageName ?? "Synced from GoHighLevel",
    industry: deal.industry ?? "—",
    annualRevenue: deal.annualRevenue ?? 0,
    contactName: deal.contactName ?? "—",
    contactEmail: deal.contactEmail ?? "—",
    contactPhone: deal.contactPhone ?? "—",
    source: deal.source ?? "—",
    internalNotes: deal.internalNotes ?? undefined,
    applications: deal.applications.map(mapApplication),
    offers: deal.offers.map(mapOffer),
    documents: [],
    tasks: [],
    notes: [],
    activities: [],
  };
}

export function parseClientApplicationStatus(value: string): ApplicationStatus | null {
  if (value in APP_STATUS_TO_DB) return value as ApplicationStatus;
  return null;
}

export function parseClientOfferStatus(value: string): OfferStatus | null {
  if (value in OFFER_STATUS_TO_DB) return value as OfferStatus;
  return null;
}

export function parseClientDealStage(value: string): DbDealStage | null {
  if (value in STAGE_TO_DB) return STAGE_TO_DB[value as DealStage];
  return null;
}
