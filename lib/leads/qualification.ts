const NON_MQL_REVENUE_LABELS = new Set([
  "de $1 a $9 mil",
  "desconhecido",
  "$0-$150,000",
]);

const REVENUE_METADATA_KEYS = [
  "monthlyRevenue",
  "monthly_revenue",
  "monthlyRevenu0e",
  "revenue",
  "monthly_rev",
  "gross_monthly_revenue",
] as const;

export function normalizeRevenueLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

export function isNonMqlRevenueLabel(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  return NON_MQL_REVENUE_LABELS.has(normalizeRevenueLabel(value));
}

const REVENUE_METADATA_KEY_PATTERN =
  /(?:monthly|mensal|mensual).*(?:revenue|receita|faturamento|ingreso|facturacion)|(?:revenue|receita|faturamento|ingreso|facturacion).*(?:monthly|mensal|mensual)|^(?:revenue|receita|faturamento|ingresos?)$/;

function pickRevenueFromRecord(record: Record<string, unknown>): string | null {
  for (const key of REVENUE_METADATA_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  for (const [key, value] of Object.entries(record)) {
    if (!REVENUE_METADATA_KEY_PATTERN.test(key.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
      continue;
    }
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  const csvRow = record.csvRow;
  if (csvRow && typeof csvRow === "object" && !Array.isArray(csvRow)) {
    return pickRevenueFromRecord(csvRow as Record<string, unknown>);
  }

  return null;
}

export function getLeadRevenueLabel(lead: {
  monthlyRevenueLabel?: string | null;
  monthlyRevenue?: number | null;
  metadata?: unknown;
}): string | null {
  if (lead.monthlyRevenueLabel?.trim()) {
    return lead.monthlyRevenueLabel.trim();
  }

  if (lead.metadata && typeof lead.metadata === "object" && !Array.isArray(lead.metadata)) {
    const fromMetadata = pickRevenueFromRecord(lead.metadata as Record<string, unknown>);
    if (fromMetadata) return fromMetadata;
  }

  if (lead.monthlyRevenue != null && Number.isFinite(lead.monthlyRevenue)) {
    return String(lead.monthlyRevenue);
  }

  return null;
}

export function isMarketingQualifiedLead(lead: {
  monthlyRevenueLabel?: string | null;
  monthlyRevenue?: number | null;
  metadata?: unknown;
}): boolean {
  const label = getLeadRevenueLabel(lead);
  if (!label) return false;
  return !isNonMqlRevenueLabel(label);
}
