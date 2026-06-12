"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Scale, Search } from "lucide-react";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatCurrency, formatNumber } from "@/components/marketing/shared/panel-section";
import { OfferStatusBadge, OwnerAvatar } from "@/components/sales/shared/badges";
import { ViewToggle, type WorkspaceView } from "@/components/sales/shared/view-toggle";
import { OfferComparison } from "@/components/sales/offers/offer-comparison";
import { OFFER_STATUSES } from "@/lib/sales/constants";
import { initialDeals } from "@/lib/sales/mock-data";
import { flattenOffers, getDealsWithMultipleOffers } from "@/lib/sales/selectors";
import type { OfferRecord, OfferStatus } from "@/lib/sales/types";

function OfferKanbanCard({ offer }: { offer: OfferRecord }) {
  const expiringSoon = offer.daysUntilExpiry <= 7 && offer.status !== "expired" && offer.status !== "accepted";
  return (
    <article
      className="rounded-md border p-2.5"
      style={{
        background: "var(--bg-surface)",
        borderColor: expiringSoon ? "var(--warning)" : "var(--border-default)",
      }}
    >
      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
        {offer.businessName}
      </p>
      <p className="mt-0.5 text-[11px]" style={{ color: "var(--accent)" }}>
        {offer.lender} · {formatCurrency(offer.amount)}
      </p>
      <p className="mt-1 text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-secondary)" }}>
        Factor {offer.factorRate.toFixed(2)}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <OfferStatusBadge status={offer.status} />
        {expiringSoon ? (
          <span className="text-[10px] font-medium" style={{ color: "var(--warning)" }}>
            {offer.daysUntilExpiry}d left
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function OffersWorkspace() {
  const [view, setView] = useState<WorkspaceView>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");
  const [compareDealId, setCompareDealId] = useState<string | null>("deal-1");

  const offers = useMemo(() => flattenOffers(initialDeals), []);
  const dealsWithOffers = useMemo(() => getDealsWithMultipleOffers(initialDeals), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offers.filter((offer) => {
      const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
      const matchesSearch =
        !q ||
        offer.businessName.toLowerCase().includes(q) ||
        offer.lender.toLowerCase().includes(q) ||
        offer.dealOwner.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [offers, search, statusFilter]);

  const metrics = useMemo(() => {
    const received = offers.filter((o) => o.status !== "expired");
    const accepted = offers.filter((o) => o.status === "accepted");
    const acceptanceRate = received.length > 0 ? (accepted.length / received.length) * 100 : 0;
    const avgAmount = received.length > 0 ? received.reduce((s, o) => s + o.amount, 0) / received.length : 0;
    const avgFactor = received.length > 0 ? received.reduce((s, o) => s + o.factorRate, 0) / received.length : 0;
    const expiring = offers.filter(
      (o) => o.daysUntilExpiry <= 7 && o.daysUntilExpiry >= 0 && !["expired", "accepted", "declined"].includes(o.status),
    ).length;
    const toPresent = offers.filter((o) => o.status === "received").length;

    return { total: offers.length, acceptanceRate, avgAmount, avgFactor, expiring, toPresent };
  }, [offers]);

  const offersByStatus = useMemo(() => {
    const map = Object.fromEntries(OFFER_STATUSES.map((s) => [s.id, [] as OfferRecord[]])) as Record<
      OfferStatus,
      OfferRecord[]
    >;
    for (const offer of filtered) {
      map[offer.status].push(offer);
    }
    return map;
  }, [filtered]);

  const compareOffers = useMemo(() => {
    if (!compareDealId) return [];
    return offers.filter((o) => o.dealId === compareDealId);
  }, [offers, compareDealId]);

  const compareDealName = compareOffers[0]?.businessName ?? "";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Funding Proposal Management"
        purpose="Track all lender offers — what needs presenting, expiring, or comparing?"
      />

      <div
        className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2.5"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Offers Received" value={formatNumber(metrics.total)} />
          <MetricCard label="Acceptance Rate" value={`${metrics.acceptanceRate.toFixed(0)}%`} changePositive />
          <MetricCard label="Avg Amount" value={formatCurrency(metrics.avgAmount)} />
          <MetricCard label="Avg Factor" value={metrics.avgFactor.toFixed(2)} />
          <MetricCard label="Expiring Soon" value={String(metrics.expiring)} highlight={metrics.expiring > 0} />
        </div>
      </div>

      {metrics.toPresent > 0 || metrics.expiring > 0 ? (
        <div
          className="flex shrink-0 items-center gap-2 border-b px-4 py-2"
          style={{ background: "var(--warning-subtle)", borderColor: "var(--border-default)" }}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--warning)" }} />
          <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>
            <strong>{metrics.toPresent} offers</strong> need to be presented · <strong>{metrics.expiring} offers</strong> expiring within 7 days
          </p>
        </div>
      ) : null}

      <div
        className="shrink-0 border-b px-4 py-3"
        style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
              Compare Offers
            </span>
          </div>
          <select
            value={compareDealId ?? ""}
            onChange={(e) => setCompareDealId(e.target.value || null)}
            className="rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select a deal...</option>
            {dealsWithOffers.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.businessName} ({deal.offers.length} offers)
              </option>
            ))}
          </select>
        </div>
        {compareOffers.length >= 2 ? (
          <div className="mt-3">
            <OfferComparison businessName={compareDealName} offers={compareOffers} compact />
          </div>
        ) : compareDealId ? (
          <p className="mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            This deal needs at least 2 offers to compare.
          </p>
        ) : null}
      </div>

      <div
        className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{
                background: statusFilter === "all" ? "var(--accent-subtle)" : "var(--bg-muted)",
                color: statusFilter === "all" ? "var(--accent)" : "var(--text-tertiary)",
              }}
            >
              All
            </button>
            {OFFER_STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className="rounded px-2 py-1 text-[10px] font-medium"
                style={{
                  background: statusFilter === s.id ? "var(--accent-subtle)" : "var(--bg-muted)",
                  color: statusFilter === s.id ? "var(--accent)" : "var(--text-tertiary)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
          style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers..."
            className="w-40 bg-transparent text-[12px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "table" ? (
          <div className="h-full overflow-y-auto p-4 enterprise-scroll">
            <PanelSection title="All Offers" description={`${filtered.length} records`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[12px]">
                  <thead>
                    <tr style={{ color: "var(--text-tertiary)" }}>
                      <th className="pb-2 pr-3 font-medium">Business</th>
                      <th className="pb-2 pr-3 font-medium">Lender</th>
                      <th className="pb-2 pr-3 text-right font-medium">Amount</th>
                      <th className="pb-2 pr-3 text-right font-medium">Factor</th>
                      <th className="pb-2 pr-3 font-medium">Term</th>
                      <th className="pb-2 pr-3 font-medium">Status</th>
                      <th className="pb-2 pr-3 font-medium">Owner</th>
                      <th className="pb-2 pr-3 font-medium">Expires</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((offer) => {
                      const dealOfferCount = offers.filter((o) => o.dealId === offer.dealId).length;
                      return (
                        <tr key={offer.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                          <td className="py-2.5 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>
                            {offer.businessName}
                          </td>
                          <td className="py-2.5 pr-3" style={{ color: "var(--text-secondary)" }}>
                            {offer.lender}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums font-medium">
                            {formatCurrency(offer.amount)}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums font-semibold" style={{ color: "var(--accent)" }}>
                            {offer.factorRate.toFixed(2)}
                          </td>
                          <td className="py-2.5 pr-3">{offer.term}</td>
                          <td className="py-2.5 pr-3">
                            <OfferStatusBadge status={offer.status} />
                          </td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1.5">
                              <OwnerAvatar name={offer.dealOwner} />
                              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                {offer.dealOwner}
                              </span>
                            </div>
                          </td>
                          <td
                            className="py-2.5 pr-3 tabular-nums"
                            style={{
                              color: offer.daysUntilExpiry <= 3 ? "var(--danger)" : "var(--text-tertiary)",
                            }}
                          >
                            {offer.expirationDate}
                          </td>
                          <td className="py-2.5">
                            {dealOfferCount >= 2 ? (
                              <button
                                type="button"
                                onClick={() => setCompareDealId(offer.dealId)}
                                className="text-[10px] font-medium hover:underline"
                                style={{ color: "var(--accent)" }}
                              >
                                Compare
                              </button>
                            ) : (
                              <span style={{ color: "var(--text-tertiary)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PanelSection>
          </div>
        ) : (
          <div className="flex h-full gap-3 overflow-x-auto p-4 enterprise-scroll">
            {OFFER_STATUSES.map(({ id, label }) => (
              <div
                key={id}
                className="flex w-[240px] shrink-0 flex-col rounded-lg border"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
              >
                <div
                  className="flex items-center justify-between border-b px-3 py-2"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] tabular-nums"
                    style={{ background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
                  >
                    {offersByStatus[id].length}
                  </span>
                </div>
                <div className="space-y-2 overflow-y-auto p-2 enterprise-scroll" style={{ maxHeight: "calc(100vh - 420px)" }}>
                  {offersByStatus[id].map((offer) => (
                    <OfferKanbanCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
