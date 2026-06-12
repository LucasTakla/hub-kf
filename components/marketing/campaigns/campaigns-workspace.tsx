"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  HeartPulse,
  Lightbulb,
  Palette,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import {
  formatCurrency,
  formatNumber,
  formatRoas,
  ModuleHeader,
  PanelSection,
} from "@/components/marketing/shared/panel-section";
import { CampaignStatusBadge } from "@/components/marketing/shared/status-badges";
import { campaignRecommendations, metaCampaigns } from "@/lib/marketing/mock-data";
import type { AiRecommendation } from "@/lib/marketing/types";

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

  const totals = useMemo(() => {
    const campaigns = metaCampaigns;
    const spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const leads = campaigns.reduce((sum, c) => sum + c.leads, 0);
    const applications = campaigns.reduce((sum, c) => sum + c.applications, 0);
    const funded = campaigns.reduce((sum, c) => sum + c.fundedDeals, 0);
    const revenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    return { spend, leads, applications, funded, revenue, roas: revenue / spend };
  }, []);

  const topCreatives = [
    { name: "UGC — Maria Funding Story", roas: 15.0, spend: 3200 },
    { name: "Video — Owner Testimonial v3", roas: 13.5, spend: 890 },
    { name: "Static — Fast Funding 24hr", roas: 11.4, spend: 2100 },
  ];

  const leadQuality = [
    { campaign: "Spanish Retargeting", score: 82, trend: "+4" },
    { campaign: "English Broad Q2", score: 71, trend: "-2" },
    { campaign: "SBA Interest Form", score: 48, trend: "-12" },
  ];

  const healthItems = [
    { label: "Budget pacing", status: "On track", ok: true },
    { label: "Creative freshness", status: "2 fatiguing", ok: false },
    { label: "Lead-to-app rate", status: "25.0% avg", ok: true },
    { label: "Tracking integrity", status: "All pixels firing", ok: true },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Execute"
        purpose="Day-to-day media buying and campaign management — what actions should I take today?"
      />
      <ModuleTabs tabs={channelTabs} activeTab={channel} onTabChange={setChannel} />

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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <MetricCard label="Spend" value={formatCurrency(totals.spend)} change="Last 30 days" />
                <MetricCard label="Leads" value={formatNumber(totals.leads)} change="+12% vs prior" changePositive />
                <MetricCard label="Applications" value={formatNumber(totals.applications)} />
                <MetricCard label="Funded Deals" value={formatNumber(totals.funded)} highlight />
                <MetricCard label="Revenue" value={formatCurrency(totals.revenue)} changePositive change="+18% vs prior" />
                <MetricCard label="ROAS" value={formatRoas(totals.roas)} highlight changePositive change="vs 8x target" />
              </div>

              <PanelSection
                title="Campaign Performance"
                description="Connected to business outcomes — not just ad metrics"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-[12px]">
                    <thead>
                      <tr style={{ color: "var(--text-tertiary)" }}>
                        <th className="pb-2 pr-4 font-medium">Campaign</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Spend</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Leads</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">MQLs</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Apps</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Funded</th>
                        <th className="pb-2 pr-4 text-right font-medium tabular-nums">Revenue</th>
                        <th className="pb-2 text-right font-medium tabular-nums">ROAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metaCampaigns.map((campaign) => (
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
                            {formatNumber(campaign.leads)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(campaign.mqls)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(campaign.applications)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                            {formatNumber(campaign.fundedDeals)}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums font-medium" style={{ color: "var(--success)" }}>
                            {formatCurrency(campaign.revenue)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                            {formatRoas(campaign.roas)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <div className="space-y-2">
                    {topCreatives.map((creative) => (
                      <div
                        key={creative.name}
                        className="flex items-center justify-between rounded-md px-2 py-2"
                        style={{ background: "var(--bg-muted)" }}
                      >
                        <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                          {creative.name}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] tabular-nums">
                          <span style={{ color: "var(--text-tertiary)" }}>{formatCurrency(creative.spend)}</span>
                          <span className="font-semibold" style={{ color: "var(--accent)" }}>
                            {formatRoas(creative.roas)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Lead Quality Analysis" description="MQL scoring by campaign">
                  <div className="space-y-2">
                    {leadQuality.map((item) => (
                      <div key={item.campaign} className="flex items-center justify-between gap-3">
                        <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                          {item.campaign}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 w-24 overflow-hidden rounded-full"
                            style={{ background: "var(--border-default)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${item.score}%`,
                                background: item.score >= 70 ? "var(--success)" : item.score >= 50 ? "var(--warning)" : "var(--danger)",
                              }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] tabular-nums font-medium" style={{ color: "var(--text-secondary)" }}>
                            {item.score}
                          </span>
                          <span
                            className="w-8 text-right text-[10px] tabular-nums"
                            style={{ color: item.trend.startsWith("+") ? "var(--success)" : "var(--danger)" }}
                          >
                            {item.trend}
                          </span>
                        </div>
                      </div>
                    ))}
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
                Placeholder data · Connect Meta Ads + CRM for live campaign outcomes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
