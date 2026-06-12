"use client";

import { useMemo, useState } from "react";
import { Bot, Plus, Search } from "lucide-react";

import { ModuleHeader } from "@/components/marketing/shared/panel-section";
import { MetricCard } from "@/components/marketing/shared/metric-card";
import { formatCurrency } from "@/components/marketing/shared/panel-section";
import { DealDetailPanel } from "@/components/sales/deal/deal-detail-panel";
import { PipelineBoard } from "@/components/sales/pipeline/pipeline-board";
import { initialDeals } from "@/lib/sales/mock-data";
import type { Deal, DealStage } from "@/lib/sales/types";

export function PipelineWorkspace() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [selectedId, setSelectedId] = useState<string | null>("deal-1");
  const [search, setSearch] = useState("");

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.businessName.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.contactName.toLowerCase().includes(q),
    );
  }, [deals, search]);

  const selectedDeal = deals.find((d) => d.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const active = deals.filter((d) => d.stage !== "funded" && d.stage !== "lost");
    const pipelineValue = active.reduce((sum, d) => sum + d.fundingAmount, 0);
    const withOffers = deals.filter((d) => d.offers.length > 0).length;
    const funded = deals.filter((d) => d.stage === "funded").length;
    return { active: active.length, pipelineValue, withOffers, funded };
  }, [deals]);

  function handleMoveDeal(dealId: string, stage: DealStage) {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage,
              daysInStage: 0,
              lastActivity: `Moved to ${stage.replace(/-/g, " ")}`,
              activities: [
                {
                  id: `act-${Date.now()}`,
                  type: "stage",
                  description: `Deal moved to ${stage.replace(/-/g, " ")}`,
                  user: "You",
                  timestamp: new Date().toISOString(),
                },
                ...d.activities,
              ],
            }
          : d,
      ),
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Deal Management"
        purpose="Your daily funding workspace — every card is a Deal moving toward funded"
      />

      <div
        className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2.5"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-2xl">
          <MetricCard label="Active Deals" value={String(stats.active)} />
          <MetricCard label="Pipeline Value" value={formatCurrency(stats.pipelineValue)} highlight />
          <MetricCard label="With Offers" value={String(stats.withOffers)} />
          <MetricCard label="Funded (MTD)" value={String(stats.funded)} changePositive />
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
            }}
          >
            <Search className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-36 bg-transparent text-[12px] outline-none sm:w-48"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Deal
          </button>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2 border-b px-4 py-2"
        style={{
          background: "var(--accent-subtle)",
          borderColor: "var(--border-default)",
        }}
      >
        <Bot className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--accent)" }} />
        <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>
          <strong>3 deals</strong> need action today — Joe&apos;s Restaurant has offers to present, Coastal Dental is ready to submit, Green Leaf is missing bank statements.
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 p-4">
          <PipelineBoard
            deals={filteredDeals}
            selectedId={selectedId}
            onSelect={(deal) => setSelectedId(deal.id)}
            onMoveDeal={handleMoveDeal}
          />
        </div>
        {selectedDeal ? (
          <DealDetailPanel deal={selectedDeal} onClose={() => setSelectedId(null)} />
        ) : null}
      </div>
    </div>
  );
}
