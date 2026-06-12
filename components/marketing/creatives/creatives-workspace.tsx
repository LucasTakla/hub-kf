"use client";

import { useState } from "react";
import {
  Film,
  Image,
  Mail,
  MessageSquare,
  Sparkles,
  Trophy,
  TrendingDown,
  Video,
} from "lucide-react";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import {
  formatCurrency,
  formatRoas,
  ModuleHeader,
  PanelSection,
} from "@/components/marketing/shared/panel-section";
import {
  CreativeStatusBadge,
  FatigueBadge,
  TestStatusBadge,
} from "@/components/marketing/shared/status-badges";
import { aiStudioPrompts, creativeTests, creatives } from "@/lib/marketing/mock-data";
import type { CreativeType } from "@/lib/marketing/types";

type CreativesTab = "library" | "performance" | "ai-studio" | "testing";

const tabs: { id: CreativesTab; label: string; description?: string }[] = [
  { id: "library", label: "Library", description: "All assets" },
  { id: "performance", label: "Performance", description: "Rankings" },
  { id: "ai-studio", label: "AI Studio", description: "Generate" },
  { id: "testing", label: "Testing", description: "Experiments" },
];

const typeIcons: Record<CreativeType, typeof Video> = {
  video: Video,
  ugc: Film,
  image: Image,
  static: Image,
  email: Mail,
  sms: MessageSquare,
};

const typeColors: Record<CreativeType, string> = {
  video: "#8b5cf6",
  ugc: "#ec4899",
  image: "#0c5ded",
  static: "#0891b2",
  email: "#059669",
  sms: "#d97706",
};

export function CreativesWorkspace() {
  const [activeTab, setActiveTab] = useState<CreativesTab>("library");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);

  const sortedByRoas = [...creatives].sort((a, b) => b.roas - a.roas);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerated(
      `**Concept:** ${prompt}\n\n**Hook:** "Your business doesn't wait — neither should your funding."\n\n**Script (30s):**\n[Open on busy restaurant kitchen]\nVO: "Maria had payroll due Friday. The bank said two weeks."\n[Cut to phone notification]\nVO: "We said same day. $85,000 approved in 4 hours."\n\n**CTA:** Apply in 2 minutes — link in bio.`,
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Produce"
        purpose="Creative asset management and AI-powered generation — what should we create, improve, or scale?"
      />
      <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto enterprise-scroll">
        <div className="p-4">
          {activeTab === "library" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {creatives.map((creative) => {
                  const Icon = typeIcons[creative.type];
                  return (
                    <article
                      key={creative.id}
                      className="overflow-hidden rounded-lg border"
                      style={{
                        background: "var(--bg-surface)",
                        borderColor: "var(--border-default)",
                      }}
                    >
                      <div
                        className="flex h-32 items-center justify-center"
                        style={{ background: `${typeColors[creative.type]}15` }}
                      >
                        <Icon className="h-10 w-10" style={{ color: typeColors[creative.type] }} strokeWidth={1.5} />
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                            {creative.name}
                          </h4>
                          <CreativeStatusBadge status={creative.status} />
                        </div>
                        <p className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {creative.creator} · {creative.createdAt}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {creative.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded px-1.5 py-0.5 text-[10px]"
                              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>CTR</p>
                            <p className="text-[12px] font-medium tabular-nums">{creative.ctr}%</p>
                          </div>
                          <div>
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>ROAS</p>
                            <p className="text-[12px] font-medium tabular-nums" style={{ color: "var(--accent)" }}>
                              {formatRoas(creative.roas)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Revenue</p>
                            <p className="text-[12px] font-medium tabular-nums">{formatCurrency(creative.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <PanelSection title="Creative Rankings" description="Sorted by ROAS — full funnel metrics">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-[12px]">
                  <thead>
                    <tr style={{ color: "var(--text-tertiary)" }}>
                      <th className="pb-2 pr-4 font-medium">Creative</th>
                      <th className="pb-2 pr-4 text-right font-medium">Spend</th>
                      <th className="pb-2 pr-4 text-right font-medium">CTR</th>
                      <th className="pb-2 pr-4 text-right font-medium">CPL</th>
                      <th className="pb-2 pr-4 text-right font-medium">Cost/App</th>
                      <th className="pb-2 pr-4 text-right font-medium">Cost/Funded</th>
                      <th className="pb-2 pr-4 text-right font-medium">Revenue</th>
                      <th className="pb-2 text-right font-medium">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByRoas.map((c, i) => (
                      <tr key={c.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="py-2.5 pr-4">
                          <span className="mr-2 text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                            #{i + 1}
                          </span>
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          {formatCurrency(c.spend)}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">{c.ctr}%</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">${c.cpl}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">${c.costPerApplication}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">${c.costPerFunded}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--success)" }}>
                          {formatCurrency(c.revenue)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                          {formatRoas(c.roas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PanelSection>
          )}

          {activeTab === "ai-studio" && (
            <div className="grid gap-4 xl:grid-cols-2">
              <PanelSection title="Generate Creative" description="AI-powered concept and script generation">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                      Describe what you want to create
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      placeholder="e.g. UGC concept for restaurant owner needing working capital..."
                      className="mt-1.5 w-full resize-none rounded-md border px-3 py-2 text-[12px] outline-none focus:ring-1"
                      style={{
                        background: "var(--bg-muted)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiStudioPrompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className="rounded-md border px-2 py-1 text-[10px] transition-colors hover:opacity-80"
                        style={{
                          borderColor: "var(--border-default)",
                          color: "var(--text-secondary)",
                          background: "var(--bg-muted)",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[12px] font-medium text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate
                  </button>
                </div>
              </PanelSection>

              <PanelSection title="Output" description="Generated concepts, scripts, and variations">
                {generated ? (
                  <pre
                    className="whitespace-pre-wrap rounded-md p-3 text-[12px] leading-relaxed"
                    style={{
                      background: "var(--bg-muted)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {generated}
                  </pre>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <Sparkles className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
                    <p className="mt-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      Generated content will appear here
                    </p>
                  </div>
                )}
              </PanelSection>
            </div>
          )}

          {activeTab === "testing" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Active Tests" value="2" />
                <MetricCard label="Winners (30d)" value="4" changePositive change="+1 vs prior" />
                <MetricCard label="Avg Fatigue Score" value="36" change="2 creatives need refresh" />
              </div>

              <PanelSection title="Creative Experiments" description="Winners, losers, and fatigue tracking">
                <div className="space-y-2">
                  {creativeTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2.5"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      <div className="flex items-center gap-3">
                        {test.status === "winner" ? (
                          <Trophy className="h-4 w-4" style={{ color: "var(--success)" }} />
                        ) : test.status === "loser" ? (
                          <TrendingDown className="h-4 w-4" style={{ color: "var(--danger)" }} />
                        ) : null}
                        <div>
                          <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                            {test.name}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            Started {test.startedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] tabular-nums">
                        <TestStatusBadge status={test.status} />
                        <span style={{ color: "var(--text-secondary)" }}>{formatCurrency(test.spend)}</span>
                        <span className="font-semibold" style={{ color: "var(--accent)" }}>
                          {formatRoas(test.roas)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span style={{ color: "var(--text-tertiary)" }}>Fatigue</span>
                          <FatigueBadge score={test.fatigueScore} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PanelSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
