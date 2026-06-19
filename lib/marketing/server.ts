import type { Lead } from "@prisma/client";

import {
  getMetaConnectionConfig,
  isMetaOAuthConfigured,
  touchMetaSync,
} from "@/lib/meta/connection";
import {
  fetchMetaCampaignInsights,
  fetchMetaCampaignStatuses,
  normalizeMetaCampaignMetrics,
} from "@/lib/meta/insights";
import type {
  MetaCampaignMetrics,
  MetaConnectionStatus,
  MetaDatePreset,
} from "@/lib/meta/types";
import { META_DATE_PRESET_MAP } from "@/lib/meta/types";
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

function mergeHubLeadsIntoCampaigns(
  campaigns: MetaCampaignMetrics[],
  leads: Lead[],
): MetaCampaignMetrics[] {
  const byCampaign = groupHubLeadsByCampaign(leads);

  return campaigns.map((campaign) => {
    const hubLeads = byCampaign.get(normalizeCampaignKey(campaign.name)) ?? 0;
    const leadsTotal = Math.max(campaign.metaLeads, hubLeads);
    return {
      ...campaign,
      hubLeads,
      leads: leadsTotal,
      cpl: leadsTotal > 0 ? campaign.spend / leadsTotal : campaign.cpl,
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
    const [rows, statuses, hubLeads] = await Promise.all([
      fetchMetaCampaignInsights(config.accessToken, config.adAccountId, datePreset),
      fetchMetaCampaignStatuses(config.accessToken, config.adAccountId),
      getHubLeadsForRange(datePreset),
    ]);

    const campaigns = mergeHubLeadsIntoCampaigns(
      normalizeMetaCampaignMetrics(rows, statuses),
      hubLeads,
    );

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
  const metaLeads = campaigns.reduce((sum, campaign) => sum + campaign.metaLeads, 0);
  const hubLeadCount = hubLeads.length;
  const leads = Math.max(metaLeads, hubLeadCount);
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const impressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);

  const metaSources = hubLeads.filter((lead) =>
    (lead.source ?? "").toLowerCase().includes("meta"),
  );
  const qualified = hubLeads.filter((lead) => lead.status === "QUALIFIED").length;
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
      label: "Qualified",
      value: qualified,
      rate: hubLeadCount > 0 ? (qualified / hubLeadCount) * 100 : 0,
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
      applications: qualified,
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
      metaLeads,
      clicks,
      impressions,
      cpl: leads > 0 ? spend / leads : 0,
      campaigns: campaigns.length,
      qualified,
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
