import type { ApplicationStatus, DealStage, OfferStatus } from "./types";

export const APPLICATION_STATUSES: { id: ApplicationStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "Submitted" },
  { id: "under-review", label: "Under Review" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
];

export const OFFER_STATUSES: { id: OfferStatus; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "presented", label: "Presented" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "expired", label: "Expired" },
];

export const PIPELINE_STAGES: { id: DealStage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "collecting-docs", label: "Collecting Docs" },
  { id: "ready-to-submit", label: "Ready to Submit" },
  { id: "submitted", label: "Submitted" },
  { id: "offers-received", label: "Offers Received" },
  { id: "negotiating", label: "Negotiating" },
  { id: "funded", label: "Funded" },
  { id: "lost", label: "Lost" },
];

export const STAGE_LABELS: Record<DealStage, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label]),
) as Record<DealStage, string>;
