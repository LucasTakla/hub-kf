import type {
  ApplicationStatus,
  DealPriority,
  DealStage,
  OfferStatus,
} from "@prisma/client";

export type DealSyncAction = "opportunity-created" | "stage-changed";

export type DealSyncInput = {
  action?: DealSyncAction;
  ghlOpportunityId: string;
  ghlContactId?: string | null;
  ghlStageName?: string | null;
  businessName?: string | null;
  fundingAmount?: number | null;
  fundedAmount?: number | null;
  owner?: string | null;
  stage?: DealStage;
  priority?: DealPriority;
  lastActivity?: string | null;
  industry?: string | null;
  annualRevenue?: number | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  source?: string | null;
  internalNotes?: string | null;
  createdAt?: Date | null;
  /** Skip expensive lead matching during bulk CSV import. */
  skipLeadLink?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type DealListFilters = {
  stage?: DealStage | "all";
  owner?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ApplicationInput = {
  dealId: string;
  lender: string;
  status?: ApplicationStatus;
  submissionDate?: Date | null;
  assignedUser?: string | null;
  notes?: string | null;
};

export type ApplicationUpdateInput = {
  lender?: string;
  status?: ApplicationStatus;
  submissionDate?: Date | null;
  assignedUser?: string | null;
  notes?: string | null;
};

export type OfferInput = {
  dealId: string;
  lender: string;
  amount: number;
  factorRate?: number | null;
  term?: string | null;
  paymentFrequency?: string | null;
  status?: OfferStatus;
  expirationDate?: Date | null;
  dailyPayment?: number | null;
  notes?: string | null;
};

export type OfferUpdateInput = {
  lender?: string;
  amount?: number;
  factorRate?: number | null;
  term?: string | null;
  paymentFrequency?: string | null;
  status?: OfferStatus;
  expirationDate?: Date | null;
  dailyPayment?: number | null;
  notes?: string | null;
};
