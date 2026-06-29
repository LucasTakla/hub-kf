"use client";

import { useCallback, useMemo, useState } from "react";
import { Bot, Search } from "lucide-react";

import { ModuleHeader } from "@/components/marketing/shared/panel-section";
import { MetricCard } from "@/components/marketing/shared/metric-card";
import { formatCurrency } from "@/components/marketing/shared/panel-section";
import { DealDetailPanel } from "@/components/sales/deal/deal-detail-panel";
import { DealsCsvImport } from "@/components/sales/pipeline/deals-csv-import";
import { PipelineBoard } from "@/components/sales/pipeline/pipeline-board";
import type { Deal } from "@/lib/sales/types";

type PipelineWorkspaceProps = {
  initialDeals: Deal[];
  initialTotal: number;
};

export function PipelineWorkspace({ initialDeals, initialTotal }: PipelineWorkspaceProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [total, setTotal] = useState(initialTotal);
  const [selectedId, setSelectedId] = useState<string | null>(initialDeals[0]?.id ?? null);
  const [search, setSearch] = useState("");

  const loadDeals = useCallback(async () => {
    const response = await fetch("/api/deals?stats=1");
    if (!response.ok) return;
    const data = (await response.json()) as { items: Deal[]; total: number };
    setDeals(data.items);
    setTotal(data.total);
    setSelectedId((current) =>
      current ? data.items.find((item) => item.id === current)?.id ?? data.items[0]?.id ?? null : data.items[0]?.id ?? null,
    );
  }, []);

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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Deal Management"
        purpose="Pipeline stages sync from GoHighLevel — move deals in GHL, track apps and offers here"
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
          <MetricCard label="Funded" value={String(stats.funded)} changePositive />
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
          <DealsCsvImport onComplete={loadDeals} />
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
          <strong>{total} deals synced</strong> from GoHighLevel. Stages are read-only here — update them in GHL and they will sync via n8n.
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 p-4">
          {filteredDeals.length > 0 ? (
            <PipelineBoard
              deals={filteredDeals}
              selectedId={selectedId}
              onSelect={(deal) => setSelectedId(deal.id)}
              readOnly
            />
          ) : (
            <div
              className="flex h-full items-center justify-center rounded-lg border border-dashed p-8 text-center"
              style={{ borderColor: "var(--border-default)" }}
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  No deals synced yet
                </p>
                <p className="mt-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  Connect GHL opportunity webhooks to <code className="text-[11px]">POST /api/deals/sync</code>
                </p>
              </div>
            </div>
          )}
        </div>
        {selectedDeal ? (
          <DealDetailPanel deal={selectedDeal} onClose={() => setSelectedId(null)} onRefresh={loadDeals} />
        ) : null}
      </div>
    </div>
  );
}
