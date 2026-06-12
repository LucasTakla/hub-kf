"use client";

import { useState } from "react";
import {
  Bot,
  Calendar,
  Send,
} from "lucide-react";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatCurrency, formatNumber, formatPercent, formatRoas } from "@/components/marketing/shared/panel-section";
import {
  analyticsOverview,
  attributionData,
  channelMetrics,
  cohorts,
  funnelStages,
  sampleChatMessages,
} from "@/lib/marketing/mock-data";
import type { DateRange } from "@/lib/marketing/types";

const dateRanges: { id: DateRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "custom", label: "Custom Range" },
];

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

      <div
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-4 py-2"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <Calendar className="mr-1 h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
        {dateRanges.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDateRange(id)}
            disabled={id === "custom"}
            className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
            style={{
              background: dateRange === id ? "var(--accent-subtle)" : "var(--bg-muted)",
              color: dateRange === id ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto enterprise-scroll">
        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Spend" value={formatCurrency(analyticsOverview.spend)} />
            <MetricCard label="Leads" value={formatNumber(analyticsOverview.leads)} change="+12% vs prior" changePositive />
            <MetricCard label="Applications" value={formatNumber(analyticsOverview.applications)} />
            <MetricCard label="Offers" value={formatNumber(analyticsOverview.offers)} />
            <MetricCard label="Funded Deals" value={formatNumber(analyticsOverview.fundedDeals)} highlight />
            <MetricCard label="Revenue" value={formatCurrency(analyticsOverview.revenue)} highlight changePositive change="+18%" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <PanelSection title="Funnel Analysis" description="Full acquisition-to-revenue pipeline">
              <div className="space-y-2">
                {funnelStages.map((stage, i) => {
                  const isSpend = i === 0;
                  const width = isSpend ? 100 : (stage.value / maxFunnelValue) * 100;
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
                            {isSpend ? formatCurrency(stage.value) : formatNumber(stage.value)}
                          </div>
                        </div>
                      </div>
                      {stage.rate !== undefined && i > 1 ? (
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
            </PanelSection>

            <PanelSection title="Channel Analysis" description="Compare performance across channels">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr style={{ color: "var(--text-tertiary)" }}>
                      <th className="pb-2 pr-3 font-medium">Channel</th>
                      <th className="pb-2 pr-3 text-right font-medium">Spend</th>
                      <th className="pb-2 pr-3 text-right font-medium">Apps</th>
                      <th className="pb-2 pr-3 text-right font-medium">Funded</th>
                      <th className="pb-2 pr-3 text-right font-medium">Revenue</th>
                      <th className="pb-2 text-right font-medium">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelMetrics.map((ch) => (
                      <tr key={ch.channel} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="py-2 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>{ch.channel}</td>
                        <td className="py-2 pr-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          {formatCurrency(ch.spend)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{ch.applications}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{ch.fundedDeals}</td>
                        <td className="py-2 pr-3 text-right tabular-nums" style={{ color: "var(--success)" }}>
                          {formatCurrency(ch.revenue)}
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                          {formatRoas(ch.roas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PanelSection>

            <PanelSection title="Cohort Analysis" description="Lead quality over time">
              <div className="space-y-3">
                {cohorts.map((cohort) => (
                  <div
                    key={cohort.name}
                    className="rounded-md border p-3"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {cohort.name}
                      </span>
                      <span className="text-[11px] tabular-nums font-semibold" style={{ color: "var(--success)" }}>
                        {formatCurrency(cohort.revenue)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Leads</p>
                        <p className="text-[12px] font-medium tabular-nums">{formatNumber(cohort.leads)}</p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>App Rate</p>
                        <p className="text-[12px] font-medium tabular-nums">{cohort.applicationRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Funded Rate</p>
                        <p className="text-[12px] font-medium tabular-nums">{cohort.fundedRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PanelSection>

            <PanelSection title="Attribution" description="Revenue contribution by channel">
              <div className="space-y-3">
                {attributionData.map((item) => (
                  <div key={item.channel}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span style={{ color: "var(--text-primary)" }}>{item.channel}</span>
                      <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {formatCurrency(item.revenue)} · {item.share}%
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full"
                      style={{ background: "var(--bg-muted)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.share}%`, background: "var(--accent)" }}
                      />
                    </div>
                  </div>
                ))}
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
            Placeholder analytics · Campaigns handles operations; Analytics handles trends and insights
          </p>
        </div>
      </div>
    </div>
  );
}
