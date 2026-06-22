"use client";

import type { MetaConnectionStatus } from "@/lib/meta/types";
import type { MetaCampaignMetrics } from "@/lib/meta/types";
import type { DateRange } from "@/lib/marketing/types";

export type MarketingOverviewResponse = {
  connected: boolean;
  metaError?: string;
  range: string;
  totals: {
    spend: number;
    leads: number;
    hubLeads: number;
    clicks: number;
    impressions: number;
    cpl: number;
    campaigns: number;
    qualified: number;
    cpmql: number;
    converted: number;
  };
  campaigns: MetaCampaignMetrics[];
  funnel: Array<{ label: string; value: number; rate?: number }>;
  channelMetrics: Array<{
    channel: string;
    spend: number;
    leads: number;
    applications: number;
    fundedDeals: number;
    revenue: number;
    roas: number;
  }>;
  leadsByCampaign: Array<{ campaign: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
};

export function mapDateRangeToApi(range: DateRange): string {
  switch (range) {
    case "today":
      return "today";
    case "yesterday":
      return "yesterday";
    case "7d":
      return "7d";
    case "90d":
      return "90d";
    default:
      return "30d";
  }
}

export async function fetchMarketingOverview(
  range: DateRange = "30d",
): Promise<MarketingOverviewResponse> {
  const response = await fetch(`/api/marketing/overview?range=${mapDateRangeToApi(range)}`);
  if (!response.ok) throw new Error("Failed to load marketing overview");
  return response.json() as Promise<MarketingOverviewResponse>;
}

export async function fetchMetaStatus(): Promise<MetaConnectionStatus> {
  const response = await fetch("/api/marketing/meta/status");
  if (!response.ok) throw new Error("Failed to load Meta status");
  return response.json() as Promise<MetaConnectionStatus>;
}

export async function connectMetaManual(input: {
  accessToken: string;
  adAccountId: string;
}): Promise<{ ok: boolean; campaigns?: number; error?: string }> {
  const response = await fetch("/api/marketing/meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { ok?: boolean; campaigns?: number; error?: string };
  if (!response.ok) return { ok: false, error: payload.error ?? "Connection failed" };
  return { ok: true, campaigns: payload.campaigns };
}

export async function disconnectMeta(): Promise<void> {
  await fetch("/api/marketing/meta", { method: "DELETE" });
}
