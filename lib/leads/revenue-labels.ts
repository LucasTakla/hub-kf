import { normalizeRevenueLabel } from "@/lib/leads/qualification";
import { parseMonthlyRevenue } from "@/lib/leads/parse-values";

/** Range floor (minimum) for each known form band — one canonical number per label. */
const EXACT_LABEL_MONTHLY_REVENUE: Record<string, number | null> = {
  "desconhecido": null,
  unknown: null,
  "nao informado": null,
  "não informado": null,
  "no informado": null,
  "de $1 a $9 mil": 1_000,
  "de 1 a 9 mil": 1_000,
  "de $10 mil a $15 mil": 10_000,
  "de 10 mil a 15 mil": 10_000,
  "de $16 mil a $29 mil": 16_000,
  "de 16 mil a 29 mil": 16_000,
  "de $30 mil a $49 mil": 30_000,
  "de 30 mil a 49 mil": 30_000,
  "de $50 mil a $99 mil": 50_000,
  "de 50 mil a 99 mil": 50_000,
  "de $100 mil a $149 mil": 100_000,
  "de 100 mil a 149 mil": 100_000,
  "$100 mil o mas": 100_000,
  "$100 mil o más": 100_000,
  "$0-$150,000": 0,
  "$150,000-$300,000": 150_000,
  "$300,000-$500,000": 300_000,
  "$500,000-$1,000,000": 500_000,
  "$1,000,000+": 1_000_000,
  "$150,000+": 150_000,
  "$300,000+": 300_000,
  "$500,000+": 500_000,
};

function parseAmountToken(token: string): number | null {
  const cleaned = token.replace(/[$,\s]/g, "").toLowerCase();
  if (!cleaned) return null;

  const milMatch = cleaned.match(/^([\d.]+)mil\+?$/);
  if (milMatch) {
    const parsed = Number.parseFloat(milMatch[1]);
    return Number.isFinite(parsed) ? parsed * 1_000 : null;
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMilRange(normalized: string): number | null {
  const rangeMatch = normalized.match(
    /de\s*\$?([\d,.]+)\s*mil\s*a\s*\$?([\d,.]+)\s*mil/,
  );
  if (rangeMatch) {
    const min = parseAmountToken(`${rangeMatch[1]}mil`);
    return min;
  }

  const plusMatch = normalized.match(/\$?([\d,.]+)\s*mil\s*o\s*m[aá]s/);
  if (plusMatch) {
    return parseAmountToken(`${plusMatch[1]}mil`);
  }

  const singleMilMatch = normalized.match(/\$?([\d,.]+)\s*mil\+?/);
  if (singleMilMatch) {
    return parseAmountToken(`${singleMilMatch[1]}mil`);
  }

  return null;
}

function parseDollarRange(normalized: string): number | null {
  const rangeMatch = normalized.match(/\$?([\d,.]+)\s*-\s*\$?([\d,.]+)/);
  if (rangeMatch) {
    return parseAmountToken(rangeMatch[1]);
  }

  const plusMatch = normalized.match(/\$?([\d,.]+)\+/);
  if (plusMatch) {
    return parseAmountToken(plusMatch[1]);
  }

  return null;
}

export function resolveMonthlyRevenueFromLabel(
  label: string | null | undefined,
): number | null {
  if (!label?.trim()) return null;

  const raw = label.trim();
  const normalized = normalizeRevenueLabel(raw);

  if (Object.prototype.hasOwnProperty.call(EXACT_LABEL_MONTHLY_REVENUE, normalized)) {
    return EXACT_LABEL_MONTHLY_REVENUE[normalized];
  }

  const fromMil = parseMilRange(normalized);
  if (fromMil != null) return fromMil;

  const fromRange = parseDollarRange(normalized);
  if (fromRange != null) return fromRange;

  return parseMonthlyRevenue(raw);
}

export function normalizeLeadRevenue(raw: unknown): {
  monthlyRevenueLabel: string | null;
  monthlyRevenue: number | null;
} {
  if (raw == null) {
    return { monthlyRevenueLabel: null, monthlyRevenue: null };
  }

  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    const label = String(raw);
    return {
      monthlyRevenueLabel: label,
      monthlyRevenue: resolveMonthlyRevenueFromLabel(label),
    };
  }

  if (typeof raw !== "string" || !raw.trim()) {
    return { monthlyRevenueLabel: null, monthlyRevenue: null };
  }

  const label = raw.trim();
  return {
    monthlyRevenueLabel: label,
    monthlyRevenue: resolveMonthlyRevenueFromLabel(label),
  };
}

export function applyStandardLeadRevenue(input: {
  monthlyRevenueLabel?: string | null;
  monthlyRevenue?: number | null;
}): {
  monthlyRevenueLabel: string | null;
  monthlyRevenue: number | null;
} {
  if (input.monthlyRevenueLabel?.trim()) {
    const label = input.monthlyRevenueLabel.trim();
    return {
      monthlyRevenueLabel: label,
      monthlyRevenue: resolveMonthlyRevenueFromLabel(label),
    };
  }

  if (input.monthlyRevenue != null && Number.isFinite(input.monthlyRevenue)) {
    const label = String(input.monthlyRevenue);
    return {
      monthlyRevenueLabel: label,
      monthlyRevenue: resolveMonthlyRevenueFromLabel(label),
    };
  }

  return { monthlyRevenueLabel: null, monthlyRevenue: null };
}
