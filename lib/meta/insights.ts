import type {
  MetaActionMetric,
  MetaCampaignInsightRow,
  MetaCampaignMetrics,
  MetaDatePreset,
} from "@/lib/meta/types";

const GRAPH_VERSION = "v21.0";

type GraphResponse<T> = T & {
  error?: { message: string; type?: string; code?: number };
  paging?: { next?: string };
};

function parseNumber(value?: string | number | null): number {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractActionValue(
  actions: MetaActionMetric[] | undefined,
  matchers: string[],
): number {
  if (!actions?.length) return 0;

  for (const matcher of matchers) {
    const match = actions.find((action) => action.action_type === matcher);
    if (match) return parseNumber(match.value);
  }

  return 0;
}

function mapEffectiveStatus(status?: string): MetaCampaignMetrics["status"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "PAUSED":
    case "CAMPAIGN_PAUSED":
      return "paused";
    case "LEARNING":
    case "LEARNING_LIMITED":
      return "learning";
    default:
      return "review";
  }
}

export async function fetchMetaCampaignInsights(
  accessToken: string,
  adAccountId: string,
  datePreset: MetaDatePreset,
): Promise<MetaCampaignInsightRow[]> {
  const accountId = adAccountId.replace(/^act_/, "");
  const params = new URLSearchParams({
    access_token: accessToken,
    level: "campaign",
    fields: [
      "campaign_id",
      "campaign_name",
      "spend",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "cpm",
      "actions",
      "cost_per_action_type",
    ].join(","),
    date_preset: datePreset,
    limit: "100",
  });

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/act_${accountId}/insights?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 300 } });
  const payload = (await response.json()) as GraphResponse<{ data?: MetaCampaignInsightRow[] }>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Failed to fetch Meta campaign insights");
  }

  return payload.data ?? [];
}

export async function fetchMetaCampaignStatuses(
  accessToken: string,
  adAccountId: string,
): Promise<Record<string, string>> {
  const accountId = adAccountId.replace(/^act_/, "");
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "id,name,effective_status,status",
    limit: "100",
  });

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/act_${accountId}/campaigns?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 300 } });
  const payload = (await response.json()) as GraphResponse<{
    data?: Array<{ id: string; effective_status?: string; status?: string }>;
  }>;

  if (!response.ok || payload.error) {
    return {};
  }

  return Object.fromEntries(
    (payload.data ?? []).map((campaign) => [
      campaign.id,
      campaign.effective_status ?? campaign.status ?? "UNKNOWN",
    ]),
  );
}

export function normalizeMetaCampaignMetrics(
  rows: MetaCampaignInsightRow[],
  statusByCampaignId: Record<string, string>,
): MetaCampaignMetrics[] {
  return rows
    .filter((row) => row.campaign_id && row.campaign_name)
    .map((row) => {
      const spend = parseNumber(row.spend);
      const metaLeads = extractActionValue(row.actions, [
        "lead",
        "onsite_conversion.lead_grouped",
        "offsite_conversion.fb_pixel_lead",
      ]);
      const cpl = metaLeads > 0 ? spend / metaLeads : 0;

      return {
        id: row.campaign_id!,
        name: row.campaign_name!,
        status: mapEffectiveStatus(statusByCampaignId[row.campaign_id!]),
        spend,
        impressions: parseNumber(row.impressions),
        clicks: parseNumber(row.clicks),
        ctr: parseNumber(row.ctr),
        cpc: parseNumber(row.cpc),
        cpm: parseNumber(row.cpm),
        metaLeads,
        cpl,
        hubLeads: 0,
        leads: metaLeads,
        applications: 0,
        fundedDeals: 0,
        revenue: 0,
        roas: spend > 0 ? 0 : 0,
        channel: "meta" as const,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export async function fetchMetaAdAccounts(accessToken: string): Promise<
  Array<{ id: string; name: string; accountId: string }>
> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: "id,name,account_id",
    limit: "50",
  });

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts?${params.toString()}`,
  );
  const payload = (await response.json()) as GraphResponse<{
    data?: Array<{ id: string; name?: string; account_id?: string }>;
  }>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Failed to fetch Meta ad accounts");
  }

  return (payload.data ?? []).map((account) => ({
    id: account.id,
    name: account.name ?? account.account_id ?? account.id,
    accountId: (account.account_id ?? account.id).replace(/^act_/, ""),
  }));
}
