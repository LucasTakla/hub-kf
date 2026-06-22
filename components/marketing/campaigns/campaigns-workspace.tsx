"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  HeartPulse,
  Lightbulb,
  Palette,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { useMarketingOverview } from "@/components/marketing/hooks/use-marketing-overview";
import { MarketingDateRangeBar } from "@/components/marketing/shared/date-range-bar";
import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  ModuleHeader,
  PanelSection,
} from "@/components/marketing/shared/panel-section";
import { CampaignStatusBadge } from "@/components/marketing/shared/status-badges";
import { getDateRangeLabel } from "@/lib/marketing/date-range";
import { campaignRecommendations } from "@/lib/marketing/mock-data";
import type { AiRecommendation, DateRange } from "@/lib/marketing/types";

type ChannelTab = "meta" | "google" | "email" | "sms";

const channelTabs: { id: ChannelTab; label: string; description?: string; disabled?: boolean }[] = [
  { id: "meta", label: "Meta", description: "Facebook & Instagram" },
  { id: "google", label: "Google", description: "Search & Display", disabled: true },
  { id: "email", label: "Email", disabled: true },
  { id: "sms", label: "SMS", disabled: true },
];

function RecommendationCard({ item }: { item: AiRecommendation }) {
  const styles = {
    action: { bg: "var(--accent-subtle)", color: "var(--accent)", icon: Lightbulb },
    warning: { bg: "var(--warning-subtle)", color: "var(--warning)", icon: AlertTriangle },
    opportunity: { bg: "var(--success-subtle)", color: "var(--success)", icon: TrendingUp },
  }[item.type];
  const Icon = styles.icon;

  return (
    <article
      className="rounded-md border p-3"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: styles.bg }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: styles.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            {item.title}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {item.description}
          </p>
          {item.campaign ? (
            <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              {item.campaign}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CampaignsWorkspace() {
  const [channel, setChannel] = useState<ChannelTab>("meta");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const { data, loading, error, refresh } = useMarketingOverview(dateRange);
  const periodLabel = getDateRangeLabel(dateRange);

  const campaigns = data?.campaigns ?? [];
  const totals = data?.totals ?? {
    spend: 0,
    leads: 0,
    hubLeads: 0,
    metaLeads: 0,
    clicks: 0,
    impressions: 0,
    cpl: 0,
    campaigns: 0,
    qualified: 0,
    cpmql: 0,
    converted: 0,
  };

  const leadQuality = useMemo(() => {
    return (data?.leadsByCampaign ?? []).slice(0, 5).map((item) => ({
      campaign: item.campaign,
      count: item.count,
    }));
  }, [data?.leadsByCampaign]);

  const healthItems = [
    {
      label: "Meta connection",
      status: data?.connected ? "Live sync" : "Not connected",
      ok: Boolean(data?.connected),
    },
    {
      label: `Hub leads (${periodLabel.toLowerCase()})`,
      status: `${totals.hubLeads} in database`,
      ok: totals.hubLeads > 0,
    },
    {
      label: "Avg CPL",
      status: totals.cpl > 0 ? formatCurrency(totals.cpl) : "—",
      ok: totals.cpl > 0 && totals.cpl < 150,
    },
    {
      label: "MQLs",
      status: `${totals.qualified} MQLs`,
      ok: totals.qualified > 0,
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Execute"
        purpose="Day-to-day media buying and campaign management — what actions should I take today?"
      />
      <ModuleTabs tabs={channelTabs} activeTab={channel} onTabChange={setChannel} />
      {channel === "meta" ? (
        <MarketingDateRangeBar value={dateRange} onChange={setDateRange} />
      ) : null}

      <div className="flex-1 overflow-y-auto enterprise-scroll">
        <div className="p-4">
          {channel !== "meta" ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                {channelTabs.find((t) => t.id === channel)?.label} campaigns
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                Coming soon — Meta is the initial implementation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {!data?.connected ? (
                <div
                  className="rounded-lg border px-4 py-3 text-[12px]"
                  style={{ borderColor: "var(--warning)", background: "var(--warning-subtle)" }}
                >
                  Connect Meta in{" "}
                  <Link href="/settings" className="font-medium underline" style={{ color: "var(--accent)" }}>
                    Settings
                  </Link>{" "}
                  to pull live Facebook spend and metrics. Hub leads from n8n still appear below once ingested.
                </div>
              ) : null}

              {data?.metaError ? (
                <div
                  className="rounded-lg border px-4 py-3 text-[12px]"
                  style={{ borderColor: "var(--danger)", background: "var(--danger-subtle)", color: "var(--danger)" }}
                >
                  Meta sync error: {data.metaError}
                </div>
              ) : null}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="Spend" value={formatCurrency(totals.spend)} change={periodLabel} />
                <MetricCard label="Leads" value={formatNumber(totals.hubLeads)} changePositive />
                <MetricCard label="MQLs" value={formatNumber(totals.qualified)} changePositive />
                <MetricCard label="CPL" value={totals.cpl > 0 ? formatCurrency(totals.cpl) : "—"} highlight />
                <MetricCard label="CPMQL" value={totals.cpmql > 0 ? formatCurrency(totals.cpmql) : "—"} />
              </div>

              <PanelSection
                title="Campaign Performance"
                description={`Meta spend and Hub leads for ${periodLabel.toLowerCase()}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-[12px]">
                    <thead>
                      <tr style={{ color: "var(--text-tertiary)" }}>
                        <th className="pb-2 pr-4 font-medium">Campaign</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Spend</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Impr.</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Clicks</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">CTR</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Leads</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">MQLs</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">CPL</th>
                        <th className="pb-2 text-right font-medium tabular-nums">CPMQL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-t transition-colors hover:opacity-90"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <td className="py-2.5 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>
                            {campaign.name}
                          </td>
                          <td className="py-2.5 pr-4">
                            <CampaignStatusBadge status={campaign.status} />
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatCurrency(campaign.spend)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(campaign.impressions)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(campaign.clicks)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatPercent(campaign.ctr)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                            {formatNumber(campaign.hubLeads)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(campaign.mqls)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {campaign.cpl > 0 ? formatCurrency(campaign.cpl) : "—"}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                            {campaign.cpmql > 0 ? formatCurrency(campaign.cpmql) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {campaigns.length === 0 ? (
                    <p className="py-6 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {loading
                        ? "Loading Meta campaigns..."
                        : data?.metaError
                          ? data.metaError
                          : "No campaigns on this ad account. Verify the Ad Account ID in Settings (act_...) matches your active Meta account."}
                    </p>
                  ) : null}
                </div>
              </PanelSection>

              <div className="grid gap-4 xl:grid-cols-2">
                <PanelSection
                  title="AI Recommendations"
                  description="Prioritized actions for today"
                  action={
                    <span
                      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                    >
                      <Bot className="h-3 w-3" />
                      AI
                    </span>
                  }
                >
                  <div className="space-y-2.5">
                    {campaignRecommendations.map((item) => (
                      <RecommendationCard key={item.id} item={item} />
                    ))}
                  </div>
                </PanelSection>

                <PanelSection
                  title="Creative Performance"
                  description="Top performers linked to campaigns"
                  action={<Palette className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />}
                >
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    Creative-level breakdown coming next — connect Meta first, then map ad-level insights.
                  </p>
                </PanelSection>

                <PanelSection title="Hub Leads by Campaign" description="Leads ingested via n8n matched to campaign names">
                  <div className="space-y-2">
                    {leadQuality.length > 0 ? leadQuality.map((item) => (
                      <div key={item.campaign} className="flex items-center justify-between gap-3">
                        <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                          {item.campaign}
                        </span>
                        <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--accent)" }}>
                          {item.count} leads
                        </span>
                      </div>
                    )) : (
                      <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        No Hub leads with campaign attribution yet.
                      </p>
                    )}
                  </div>
                </PanelSection>

                <PanelSection
                  title="Campaign Health"
                  description="Operational monitoring"
                  action={<HeartPulse className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />}
                >
                  <div className="space-y-2">
                    {healthItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                          {item.label}
                        </span>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: item.ok ? "var(--success)" : "var(--warning)" }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </PanelSection>
              </div>

              <p className="text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {error ? error : data?.connected ? "Live Meta data + Hub leads" : "Connect Meta in Settings for live spend metrics"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
