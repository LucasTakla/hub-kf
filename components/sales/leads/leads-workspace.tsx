"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import type { Lead, LeadStatus } from "@prisma/client";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatNumber } from "@/components/marketing/shared/panel-section";
import { formatLeadDate, formatLeadTime, formatMonthlyRevenue } from "@/lib/leads/parse-values";
import { LeadStatusBadge } from "@/components/sales/shared/badges";
import { LeadsCsvImport } from "@/components/sales/leads/leads-csv-import";
import { LEAD_STATUSES } from "@/lib/leads/constants";
import type { LeadStats } from "@/lib/leads/types";

type LeadsWorkspaceProps = {
  initialLeads: Lead[];
  initialTotal: number;
  initialStats: LeadStats;
  initialSources: string[];
};

function displayName(lead: Lead) {
  return lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown lead";
}

function formatWhen(timestamp: string | Date) {
  return `${formatLeadDate(timestamp)} · ${formatLeadTime(timestamp)}`;
}

export function LeadsWorkspace({
  initialLeads,
  initialTotal,
  initialStats,
  initialSources,
}: LeadsWorkspaceProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [total, setTotal] = useState(initialTotal);
  const [stats, setStats] = useState(initialStats);
  const [sources, setSources] = useState(initialSources);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams({ stats: "1" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/leads?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load leads");

      const data = (await response.json()) as {
        items: Lead[];
        total: number;
        stats: LeadStats;
        sources: string[];
      };

      setLeads(data.items);
      setTotal(data.total);
      setStats(data.stats);
      setSources(data.sources);
    } finally {
      setRefreshing(false);
    }
  }, [search, sourceFilter, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadLeads();
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadLeads]);

  const visibleSources = useMemo(() => {
    const unique = new Set([...sources, ...leads.map((lead) => lead.source).filter(Boolean) as string[]]);
    return Array.from(unique).sort();
  }, [leads, sources]);

  async function handleStatusChange(leadId: string, status: LeadStatus) {
    setUpdatingId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update lead");

      const updated = (await response.json()) as Lead;
      setLeads((current) => current.map((lead) => (lead.id === updated.id ? updated : lead)));
      setSelected((current) => (current?.id === updated.id ? updated : current));
      await loadLeads();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ModuleHeader
          title="Inbound leads"
          purpose="Live lead intake from n8n — replaces the Google Sheets log as the source of truth"
        />

        <div
          className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, business, campaign, ad..."
              className="w-full rounded-md border py-1.5 pl-8 pr-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{
                background: "var(--bg-muted)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "all")}
            className="rounded-md border px-2 py-1.5 text-[12px]"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-md border px-2 py-1.5 text-[12px]"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="all">All sources</option>
            {visibleSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <LeadsCsvImport onComplete={loadLeads} />

          <button
            type="button"
            onClick={() => void loadLeads()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total leads" value={formatNumber(stats.total)} />
            <MetricCard label="Today" value={formatNumber(stats.today)} highlight />
            <MetricCard label="New" value={formatNumber(stats.new)} />
            <MetricCard label="Qualified" value={formatNumber(stats.qualified)} changePositive />
            <MetricCard label="Duplicates" value={formatNumber(stats.duplicate)} />
          </div>

          <PanelSection
            title="Lead inbox"
            description={`${total} lead${total === 1 ? "" : "s"} matching filters`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-[12px]">
                <thead>
                  <tr style={{ color: "var(--text-tertiary)" }}>
                    <th className="pb-2 pr-4 font-medium">Lead</th>
                    <th className="pb-2 pr-4 font-medium">Business</th>
                    <th className="pb-2 pr-4 font-medium">Contact</th>
                    <th className="pb-2 pr-4 font-medium">Source</th>
                    <th className="pb-2 pr-4 font-medium">Campaign</th>
                    <th className="pb-2 pr-4 font-medium">Ad</th>
                    <th className="pb-2 pr-4 font-medium">Monthly rev.</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelected(lead)}
                      className="cursor-pointer border-t transition-colors hover:bg-[var(--bg-muted)]"
                      style={{
                        borderColor: "var(--border-subtle)",
                        background: selected?.id === lead.id ? "var(--bg-muted)" : undefined,
                      }}
                    >
                      <td className="py-2.5 pr-4">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {displayName(lead)}
                        </p>
                        {lead.owner ? (
                          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            Owner: {lead.owner}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: "var(--text-secondary)" }}>
                        {lead.businessName ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <p style={{ color: "var(--text-secondary)" }}>{lead.email ?? "—"}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {lead.phone ?? "—"}
                        </p>
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: "var(--text-secondary)" }}>
                        {lead.source ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: "var(--text-secondary)" }}>
                        {lead.campaign ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: "var(--text-secondary)" }}>
                        {lead.ad ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {formatMonthlyRevenue(lead.monthlyRevenue)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                        {formatLeadDate(lead.createdAt)}
                      </td>
                      <td className="py-2.5 tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                        {formatLeadTime(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {leads.length === 0 ? (
                <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  No leads yet. Import a CSV or point n8n at <code>/api/leads/ingest</code> for live intake.
                </p>
              ) : null}
            </div>
          </PanelSection>
        </div>
      </div>

      {selected ? (
        <aside
          className="flex w-[320px] shrink-0 flex-col border-l"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {displayName(selected)}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Received {formatWhen(selected.createdAt)}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
            <div className="space-y-3 text-[12px]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Status
                </p>
                <select
                  value={selected.status}
                  disabled={updatingId === selected.id}
                  onChange={(event) =>
                    void handleStatusChange(selected.id, event.target.value as LeadStatus)
                  }
                  className="mt-1 w-full rounded-md border px-2 py-1.5 text-[12px]"
                  style={{
                    background: "var(--bg-muted)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {[
                ["Business", selected.businessName],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Source", selected.source],
                ["Campaign", selected.campaign],
                ["Ad set", selected.adSet],
                ["Ad", selected.ad],
                ["Monthly revenue", selected.monthlyRevenue != null ? formatMonthlyRevenue(selected.monthlyRevenue) : null],
                ["GHL contact", selected.ghlContactId],
                ["External ID", selected.externalId],
                ["Owner", selected.owner],
                ["Notes", selected.notes],
              ].map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      {label}
                    </p>
                    <p className="mt-0.5 break-all" style={{ color: "var(--text-secondary)" }}>
                      {value}
                    </p>
                  </div>
                ) : null,
              )}
            </div>

            {selected.metadata ? (
              <div className="mt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Raw payload
                </p>
                <pre
                  className="overflow-x-auto rounded-md border p-2 text-[10px] leading-relaxed"
                  style={{
                    background: "var(--bg-muted)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {JSON.stringify(selected.metadata, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
