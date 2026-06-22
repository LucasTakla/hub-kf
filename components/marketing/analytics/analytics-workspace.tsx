"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
} from "lucide-react";

import { useMarketingOverview } from "@/components/marketing/hooks/use-marketing-overview";
import { MarketingDateRangeBar } from "@/components/marketing/shared/date-range-bar";
import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatCurrency, formatNumber, formatPercent } from "@/components/marketing/shared/panel-section";
import { sampleChatMessages } from "@/lib/marketing/mock-data";
import type { DateRange } from "@/lib/marketing/types";

const suggestedQuestions = [
  "Why did funded deals decrease last week?",
  "Compare English vs Spanish campaigns",
  "Which campaigns generated the most funded revenue?",
  "Which creative had the highest ROAS?",
  "Why is CPL increasing?",
];

export function AnalyticsWorkspace() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [messages, setMessages] = useState(sampleChatMessages);
  const [input, setInput] = useState("");
  const { data, loading } = useMarketingOverview(dateRange);

  const totals = data?.totals;
  const funnelStages = data?.funnel ?? [];
  const channelMetrics = data?.channelMetrics ?? [];
  const leadsByCampaign = data?.leadsByCampaign ?? [];
  const leadsBySource = data?.leadsBySource ?? [];
  const totalSourceLeads = leadsBySource.reduce((sum, item) => sum + item.count, 0);
  const maxFunnelValue = funnelStages[1]?.value ?? 1;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, content: input.trim() };
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: `a-${Date.now()}`,
        role: "assistant" as const,
        content:
          "I'm analyzing your marketing data across campaigns, creatives, and funnel metrics. Once integrations are connected, I'll provide data-backed answers to questions like this in real time.\n\nFor now, based on placeholder data: Spanish campaigns show 22% higher ROAS than English, and creative fatigue on SBA tests is the primary CPL driver this period.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Understand"
        purpose="Business intelligence and marketing analysis — what is happening and why?"
      />

      <MarketingDateRangeBar value={dateRange} onChange={setDateRange} />

      <div className="flex-1 overflow-y-auto enterprise-scroll">
        <div className="space-y-4 p-4">
          {!data?.connected ? (
            <div
              className="rounded-lg border px-4 py-3 text-[12px]"
              style={{ borderColor: "var(--warning)", background: "var(--warning-subtle)" }}
            >
              Meta not connected — funnel uses Hub leads only. Connect in{" "}
              <Link href="/settings" className="font-medium underline" style={{ color: "var(--accent)" }}>
                Settings
              </Link>
              .
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Spend" value={formatCurrency(totals?.spend ?? 0)} />
            <MetricCard label="Leads" value={formatNumber(totals?.hubLeads ?? 0)} changePositive />
            <MetricCard label="CPL" value={totals?.cpl ? formatCurrency(totals.cpl) : "—"} />
            <MetricCard label="Clicks" value={formatNumber(totals?.clicks ?? 0)} />
            <MetricCard label="MQLs" value={formatNumber(totals?.qualified ?? 0)} />
            <MetricCard label="Converted" value={formatNumber(totals?.converted ?? 0)} highlight />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PanelSection title="Funnel Analysis" description="Meta impressions → Hub lead outcomes">
              {funnelStages.length > 0 ? (
              <div className="space-y-2">
                {funnelStages.map((stage, i) => {
                  const isSpend = false;
                  const width = (stage.value / maxFunnelValue) * 100;
                  return (
                    <div key={stage.label} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {stage.label}
                      </span>
                      <div className="flex-1">
                        <div
                          className="h-7 overflow-hidden rounded-md"
                          style={{ background: "var(--bg-muted)" }}
                        >
                          <div
                            className="flex h-full items-center px-2 text-[11px] font-medium tabular-nums text-white transition-all"
                            style={{
                              width: `${Math.max(width, 12)}%`,
                              background: "var(--accent)",
                            }}
                          >
                            {formatNumber(stage.value)}
                          </div>
                        </div>
                      </div>
                      {stage.rate !== undefined && i > 0 ? (
                        <span className="w-12 shrink-0 text-right text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                          {formatPercent(stage.rate)}
                        </span>
                      ) : (
                        <span className="w-12 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              ) : (
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {loading ? "Loading funnel..." : "No funnel data for this period."}
                </p>
              )}
            </PanelSection>

            <PanelSection title="Channel Analysis" description="Meta spend vs Hub lead volume">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr style={{ color: "var(--text-tertiary)" }}>
                      <th className="pb-2 pr-3 font-medium">Channel</th>
                      <th className="pb-2 pr-3 text-right font-medium">Spend</th>
                      <th className="pb-2 pr-3 text-right font-medium">Leads</th>
                      <th className="pb-2 pr-3 text-right font-medium">Qualified</th>
                      <th className="pb-2 text-right font-medium">Converted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelMetrics.map((ch) => (
                      <tr key={ch.channel} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="py-2 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>{ch.channel}</td>
                        <td className="py-2 pr-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          {formatCurrency(ch.spend)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{ch.leads}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{ch.applications}</td>
                        <td className="py-2 text-right tabular-nums">{ch.fundedDeals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PanelSection>

            <PanelSection title="Leads by Campaign" description="Hub leads grouped by campaign name">
              <div className="space-y-3">
                {leadsByCampaign.length > 0 ? (
                  leadsByCampaign.map((item) => (
                    <div
                      key={item.campaign}
                      className="rounded-md border p-3"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                          {item.campaign}
                        </span>
                        <span className="text-[11px] tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                          {formatNumber(item.count)} leads
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {loading ? "Loading..." : "No campaign attribution on Hub leads yet."}
                  </p>
                )}
              </div>
            </PanelSection>

            <PanelSection title="Lead Sources" description="Where Hub leads are coming from">
              <div className="space-y-3">
                {leadsBySource.length > 0 ? (
                  leadsBySource.map((item) => {
                    const share = totalSourceLeads > 0 ? Math.round((item.count / totalSourceLeads) * 100) : 0;
                    return (
                      <div key={item.source}>
                        <div className="mb-1 flex items-center justify-between text-[12px]">
                          <span style={{ color: "var(--text-primary)" }}>{item.source}</span>
                          <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatNumber(item.count)} · {share}%
                          </span>
                        </div>
                        <div
                          className="h-2 overflow-hidden rounded-full"
                          style={{ background: "var(--bg-muted)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, background: "var(--accent)" }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {loading ? "Loading..." : "No source data on Hub leads yet."}
                  </p>
                )}
              </div>
            </PanelSection>
          </div>

          <PanelSection
            title="AI Analyst"
            description="Ask questions about your marketing data"
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
            <div
              className="mb-3 flex flex-wrap gap-1.5"
            >
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="rounded-md border px-2 py-1 text-[10px] transition-colors hover:opacity-80"
                  style={{
                    borderColor: "var(--border-default)",
                    color: "var(--text-secondary)",
                    background: "var(--bg-muted)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div
              className="mb-3 max-h-64 space-y-3 overflow-y-auto rounded-md p-3 enterprise-scroll"
              style={{ background: "var(--bg-muted)" }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-lg px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: msg.role === "user" ? "var(--accent)" : "var(--bg-surface)",
                      color: msg.role === "user" ? "white" : "var(--text-primary)",
                      border: msg.role === "assistant" ? "1px solid var(--border-default)" : undefined,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about campaigns, creatives, funnel trends..."
                className="flex-1 rounded-md border px-3 py-2 text-[12px] outline-none"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                <Send className="h-3.5 w-3.5" />
                Ask
              </button>
            </div>
          </PanelSection>

          <p className="text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Live data from Meta Ads + Hub leads · Connect Meta in Settings for spend metrics
          </p>
        </div>
      </div>
    </div>
  );
}
