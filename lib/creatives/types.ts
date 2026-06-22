import type { CreativeStatus, CreativeType, LeadNationality, Prisma } from "@prisma/client";

export const CREATIVE_TYPES: { id: CreativeType; label: string }[] = [
  { id: "VIDEO", label: "Video" },
  { id: "UGC", label: "UGC" },
  { id: "IMAGE", label: "Image" },
  { id: "STATIC", label: "Static" },
];

export const CREATIVE_STATUSES: { id: CreativeStatus; label: string }[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "APPROVED", label: "Approved" },
  { id: "LIVE", label: "Live" },
  { id: "TESTING", label: "Testing" },
  { id: "ARCHIVED", label: "Archived" },
];

export const CREATIVE_STATUS_LABELS: Record<CreativeStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  LIVE: "Live",
  TESTING: "Testing",
  ARCHIVED: "Archived",
};

export const CREATIVE_TYPE_LABELS: Record<CreativeType, string> = {
  VIDEO: "Video",
  UGC: "UGC",
  IMAGE: "Image",
  STATIC: "Static",
};

export type CreativeListFilters = {
  status?: CreativeStatus | "all";
  nationality?: LeadNationality | "all";
  type?: CreativeType | "all";
  search?: string;
  limit?: number;
  offset?: number;
};

export type CreativeInput = {
  name: string;
  type?: CreativeType;
  status?: CreativeStatus;
  nationality?: LeadNationality | null;
  metaAdName?: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  script?: string | null;
  tags?: string[];
  creator?: string | null;
  notes?: string | null;
};

export type CreativeUpdateInput = Partial<
  Omit<CreativeInput, "fileName" | "mimeType" | "fileSize">
>;

export type CreativeRecord = Prisma.CreativeGetPayload<object> & {
  assetUrl: string;
};
