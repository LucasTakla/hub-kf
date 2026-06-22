import type { Lead } from "@prisma/client";

import {
  getMetaConnectionConfig,
  isMetaOAuthConfigured,
  touchMetaSync,
} from "@/lib/meta/connection";
import {
  fetchMetaCampaignInsights,
  fetchMetaCampaigns,
  mergeInsightsWithCampaignList,
} from "@/lib/meta/insights";
import type {
  MetaCampaignMetrics,
  MetaConnectionStatus,
  MetaDatePreset,
} from "@/lib/meta/types";
import { META_DATE_PRESET_MAP } from "@/lib/meta/types";
import { isMarketingQualifiedLead } from "@/lib/leads/qualification";
import type { ChannelMetrics, FunnelStage } from "@/lib/marketing/types";
import { prisma } from "@/lib/prisma";

function dateRangeStart(preset: MetaDatePreset): Date | null {
  const now = new Date();
  switch (preset) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "yesterday": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "last_7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "last_30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "last_90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

function normalizeCampaignKey(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function groupHubLeadsByCampaign(leads: Lead[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const lead of leads) {
    const key = normalizeCampaignKey(lead.campaign);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function groupHubMqlsByCampaign(leads: Lead[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const lead of leads) {
    if (!isMarketingQualifiedLead(lead)) continue;
    const key = normalizeCampaignKey(lead.campaign);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function appendHubOnlyCampaigns(
  campaigns: MetaCampaignMetrics[],
  leads: Lead[],
): MetaCampaignMetrics[] {
  const existingNames = new Set(
    campaigns.map((campaign) => normalizeCampaignKey(campaign.name)),
  );
  const hubOnly = new Map<string, { name: string; leads: number }>();
  const mqlsByCampaign = groupHubMqlsByCampaign(leads);

  for (const lead of leads) {
    const name = lead.campaign?.trim();
    if (!name) continue;

    const key = normalizeCampaignKey(name);
    if (existingNames.has(key)) continue;

    const current = hubOnly.get(key);
    if (current) {
      current.leads += 1;
    } else {
      hubOnly.set(key, { name, leads: 1 });
    }
  }

  const extras: MetaCampaignMetrics[] = Array.from(hubOnly.values()).map(
    ({ name, leads: leadCount }) => {
      const mqls = mqlsByCampaign.get(normalizeCampaignKey(name)) ?? 0;
      return {
      id: `hub-${normalizeCampaignKey(name)}`,
      name,
      status: "review",
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      metaLeads: 0,
      cpl: 0,
      hubLeads: leadCount,
      leads: leadCount,
      mqls,
      cpmql: 0,
      applications: mqls,
      fundedDeals: 0,
      revenue: 0,
      roas: 0,
      channel: "meta",
      };
    },
  );

  return [...campaigns, ...extras].sort((a, b) => b.spend - a.spend || b.leads - a.leads);
}

function mergeHubLeadsIntoCampaigns(
  campaigns: MetaCampaignMetrics[],
  leads: Lead[],
): MetaCampaignMetrics[] {
  const byCampaign = groupHubLeadsByCampaign(leads);
  const mqlsByCampaign = groupHubMqlsByCampaign(leads);

  return campaigns.map((campaign) => {
    const hubLeads = byCampaign.get(normalizeCampaignKey(campaign.name)) ?? 0;
    const mqls = mqlsByCampaign.get(normalizeCampaignKey(campaign.name)) ?? 0;
    return {
      ...campaign,
      hubLeads,
      leads: hubLeads,
      mqls,
      cpmql: mqls > 0 ? campaign.spend / mqls : 0,
      applications: mqls,
      cpl: hubLeads > 0 ? campaign.spend / hubLeads : 0,
    };
  });
}

export async function getMetaConnectionStatus(): Promise<MetaConnectionStatus> {
  const integration = await prisma.integration.findUnique({ where: { slug: "meta-ads" } });
  const config = await getMetaConnectionConfig();

  if (!config) {
    return {
      connected: false,
      source: "none",
      oauthAvailable: isMetaOAuthConfigured(),
    };
  }

  const source =
    integration?.config &&
    typeof integration.config === "object" &&
    "accessToken" in (integration.config as Record<string, unknown>)
      ? "database"
      : "environment";

  return {
    connected: true,
    adAccountId: config.adAccountId,
    lastSyncAt: integration?.lastSyncAt?.toISOString() ?? null,
    source,
    oauthAvailable: isMetaOAuthConfigured(),
  };
}

export async function getHubLeadsForRange(preset: MetaDatePreset): Promise<Lead[]> {
  const start = dateRangeStart(preset);
  return prisma.lead.findMany({
    where: start
      ? {
          createdAt: { gte: start },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getMetaCampaignMetrics(
  range: string = "30d",
): Promise<{
  connected: boolean;
  campaigns: MetaCampaignMetrics[];
  error?: string;
}> {
  const config = await getMetaConnectionConfig();
  if (!config) {
    return { connected: false, campaigns: [] };
  }

  const datePreset = META_DATE_PRESET_MAP[range] ?? "last_30d";

  try {
    const [rows, metaCampaigns, hubLeads] = await Promise.all([
      fetchMetaCampaignInsights(config.accessToken, config.adAccountId, datePreset),
      fetchMetaCampaigns(config.accessToken, config.adAccountId),
      getHubLeadsForRange(datePreset),
    ]);

    const merged = mergeInsightsWithCampaignList(rows, metaCampaigns);
    const withHubLeads = mergeHubLeadsIntoCampaigns(merged, hubLeads);
    const campaigns = appendHubOnlyCampaigns(withHubLeads, hubLeads);

    if (campaigns.length === 0 && metaCampaigns.length === 0) {
      return {
        connected: true,
        campaigns: [],
        error:
          "No campaigns found on this ad account. Check the Ad Account ID in Settings matches the account where your ads run.",
      };
    }

    await touchMetaSync();
    return { connected: true, campaigns };
  } catch (error) {
    return {
      connected: true,
      campaigns: [],
      error: error instanceof Error ? error.message : "Failed to sync Meta campaigns",
    };
  }
}

export async function getMarketingOverview(range: string = "30d") {
  const datePreset = META_DATE_PRESET_MAP[range] ?? "last_30d";
  const [metaResult, hubLeads, metaStatus] = await Promise.all([
    getMetaCampaignMetrics(range),
    getHubLeadsForRange(datePreset),
    getMetaConnectionStatus(),
  ]);

  const campaigns = metaResult.campaigns;
  const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const hubLeadCount = hubLeads.length;
  const leads = hubLeadCount;
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const impressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);

  const metaSources = hubLeads.filter((lead) =>
    (lead.source ?? "").toLowerCase().includes("meta"),
  );
  const mqls = hubLeads.filter(isMarketingQualifiedLead).length;
  const converted = hubLeads.filter((lead) => lead.status === "CONVERTED").length;

  const funnel: FunnelStage[] = [
    { label: "Ad impressions", value: impressions, rate: 100 },
    {
      label: "Clicks",
      value: clicks,
      rate: impressions > 0 ? (clicks / impressions) * 100 : 0,
    },
    {
      label: "Leads (Hub)",
      value: hubLeadCount,
      rate: clicks > 0 ? (hubLeadCount / clicks) * 100 : 0,
    },
    {
      label: "MQLs",
      value: mqls,
      rate: hubLeadCount > 0 ? (mqls / hubLeadCount) * 100 : 0,
    },
    {
      label: "Converted",
      value: converted,
      rate: hubLeadCount > 0 ? (converted / hubLeadCount) * 100 : 0,
    },
  ];

  const channelMetrics: ChannelMetrics[] = [
    {
      channel: "Meta",
      spend,
      leads,
      applications: mqls,
      fundedDeals: converted,
      revenue: 0,
      roas: spend > 0 ? 0 : 0,
    },
  ];

  const leadsByCampaign = Object.entries(
    hubLeads.reduce<Record<string, number>>((acc, lead) => {
      const key = lead.campaign ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([campaign, count]) => ({ campaign, count }));

  const leadsBySource = Object.entries(
    hubLeads.reduce<Record<string, number>>((acc, lead) => {
      const key = lead.source ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));

  return {
    connected: metaStatus.connected,
    metaError: metaResult.error,
    range,
    totals: {
      spend,
      leads,
      hubLeads: hubLeadCount,
      clicks,
      impressions,
      cpl: leads > 0 ? spend / leads : 0,
      cpmql: mqls > 0 ? spend / mqls : 0,
      campaigns: campaigns.length,
      qualified: mqls,
      converted,
    },
    campaigns,
    funnel,
    channelMetrics,
    leadsByCampaign,
    leadsBySource,
    metaSources: metaSources.length,
  };
}
