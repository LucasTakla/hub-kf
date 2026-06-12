export type DealStage =
  | "new"
  | "qualified"
  | "collecting-docs"
  | "ready-to-submit"
  | "submitted"
  | "offers-received"
  | "negotiating"
  | "funded"
  | "lost";

export type DealPriority = "high" | "medium" | "low";

export type ApplicationStatus = "draft" | "submitted" | "under-review" | "approved" | "declined";

export type OfferStatus = "received" | "presented" | "accepted" | "declined" | "expired";

export type DocumentStatus = "missing" | "requested" | "received" | "verified";

export type TaskStatus = "open" | "in-progress" | "done";

export type DealApplication = {
  id: string;
  lender: string;
  submissionDate: string | null;
  status: ApplicationStatus;
  notes?: string;
  assignedUser: string;
  responseDays?: number | null;
};

export type DealOffer = {
  id: string;
  lender: string;
  amount: number;
  factorRate: number;
  term: string;
  paymentFrequency: string;
  status: OfferStatus;
  expirationDate: string;
  dailyPayment?: number;
};

export type ApplicationRecord = DealApplication & {
  dealId: string;
  businessName: string;
  dealOwner: string;
  fundingAmount: number;
};

export type OfferRecord = DealOffer & {
  dealId: string;
  businessName: string;
  dealOwner: string;
  fundingAmount: number;
  daysUntilExpiry: number;
};

export type DealDocument = {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  uploadedAt: string | null;
};

export type DealTask = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: TaskStatus;
  priority: DealPriority;
};

export type DealNote = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type DealActivity = {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
};

export type Deal = {
  id: string;
  businessName: string;
  fundingAmount: number;
  owner: string;
  stage: DealStage;
  daysInStage: number;
  priority: DealPriority;
  lastActivity: string;
  industry: string;
  annualRevenue: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: string;
  internalNotes?: string;
  applications: DealApplication[];
  offers: DealOffer[];
  documents: DealDocument[];
  tasks: DealTask[];
  notes: DealNote[];
  activities: DealActivity[];
};

export type Lender = {
  id: string;
  name: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  fundingTypes: string[];
  minAmount: number;
  maxAmount: number;
  industries: string[];
  notes?: string;
  applicationsSubmitted: number;
  approvalRate: number;
  fundingRate: number;
  averageDealSize: number;
  averageResponseDays: number;
  averageOfferAmount: number;
};

export type DealDetailTab =
  | "overview"
  | "applications"
  | "offers"
  | "documents"
  | "tasks"
  | "notes"
  | "activity";
