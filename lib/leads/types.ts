import type { Lead, LeadStatus } from "@prisma/client";

export type LeadListFilters = {
  status?: LeadStatus | "all";
  source?: string | "all";
  search?: string;
  limit?: number;
  offset?: number;
};

export type LeadIngestInput = {
  externalId?: string | null;
  ghlContactId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  businessName?: string | null;
  source?: string | null;
  campaign?: string | null;
  adSet?: string | null;
  ad?: string | null;
  owner?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  /** Original lead date from sheet/CRM — used for historical backfill */
  createdAt?: string | Date | null;
  status?: LeadStatus;
};

export type LeadStats = {
  total: number;
  today: number;
  new: number;
  qualified: number;
  duplicate: number;
  bySource: { source: string; count: number }[];
};
