import type { DealStage } from "@prisma/client";

const DEFAULT_GHL_STAGE_MAP: Record<string, DealStage> = {
  new: "NEW",
  "new lead": "NEW",
  "new deal": "NEW",
  lead: "NEW",
  "attempting contact": "NEW",
  qualified: "QUALIFIED",
  qualification: "QUALIFIED",
  "connected - qualifying": "QUALIFIED",
  "connected qualifying": "QUALIFIED",
  "collecting docs": "COLLECTING_DOCS",
  "collecting documents": "COLLECTING_DOCS",
  documents: "COLLECTING_DOCS",
  "docs requested": "COLLECTING_DOCS",
  "ready to submit": "READY_TO_SUBMIT",
  "ready for submission": "READY_TO_SUBMIT",
  submitted: "SUBMITTED",
  "submitted to lenders": "SUBMITTED",
  "in underwriting": "SUBMITTED",
  "awaiting response": "SUBMITTED",
  "offers received": "OFFERS_RECEIVED",
  offers: "OFFERS_RECEIVED",
  "offer received": "OFFERS_RECEIVED",
  offer: "NEGOTIATING",
  negotiating: "NEGOTIATING",
  negotiation: "NEGOTIATING",
  "offer out": "NEGOTIATING",
  "presenting offer": "NEGOTIATING",
  funded: "FUNDED",
  closed: "FUNDED",
  won: "FUNDED",
  lost: "LOST",
  dead: "LOST",
  declined: "LOST",
  unqualified: "LOST",
};

function normalizeStageKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseCustomStageMap(): Record<string, DealStage> {
  const raw = process.env.GHL_STAGE_MAP?.trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const map: Record<string, DealStage> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const stage = value.trim().toUpperCase().replace(/-/g, "_") as DealStage;
      map[normalizeStageKey(key)] = stage;
    }
    return map;
  } catch {
    return {};
  }
}

export function mapGhlStageToDealStage(
  ghlStageName: string | null | undefined,
): DealStage | undefined {
  if (!ghlStageName?.trim()) return undefined;

  const key = normalizeStageKey(ghlStageName);
  const custom = parseCustomStageMap();

  if (custom[key]) return custom[key];
  if (DEFAULT_GHL_STAGE_MAP[key]) return DEFAULT_GHL_STAGE_MAP[key];

  const slug = key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slugToStage: Record<string, DealStage> = {
    new: "NEW",
    qualified: "QUALIFIED",
    "collecting-docs": "COLLECTING_DOCS",
    "ready-to-submit": "READY_TO_SUBMIT",
    submitted: "SUBMITTED",
    "offers-received": "OFFERS_RECEIVED",
    negotiating: "NEGOTIATING",
    funded: "FUNDED",
    lost: "LOST",
  };

  return slugToStage[slug];
}
