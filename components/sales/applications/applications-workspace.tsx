"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatNumber } from "@/components/marketing/shared/panel-section";
import { ApplicationStatusBadge, OwnerAvatar } from "@/components/sales/shared/badges";
import { ViewToggle, type WorkspaceView } from "@/components/sales/shared/view-toggle";
import { APPLICATION_STATUSES } from "@/lib/sales/constants";
import { initialDeals } from "@/lib/sales/mock-data";
import { flattenApplications } from "@/lib/sales/selectors";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/sales/types";

function ApplicationKanbanCard({ app }: { app: ApplicationRecord }) {
  return (
    <article
      className="rounded-md border p-2.5"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
        {app.businessName}
      </p>
      <p className="mt-0.5 text-[11px] font-medium" style={{ color: "var(--accent)" }}>
        {app.lender}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <OwnerAvatar name={app.assignedUser} />
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {app.assignedUser.split(" ")[0]}
          </span>
        </div>
        {app.responseDays != null && app.status !== "draft" ? (
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
            {app.responseDays}d
          </span>
        ) : null}
      </div>
      {app.notes ? (
        <p className="mt-1.5 truncate text-[10px]" style={{ color: "var(--text-secondary)" }}>
          {app.notes}
        </p>
      ) : null}
    </article>
  );
}

export function ApplicationsWorkspace() {
  const [view, setView] = useState<WorkspaceView>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const applications = useMemo(() => flattenApplications(initialDeals), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesSearch =
        !q ||
        app.businessName.toLowerCase().includes(q) ||
        app.lender.toLowerCase().includes(q) ||
        app.assignedUser.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  const metrics = useMemo(() => {
    const submitted = applications.filter((a) => a.status !== "draft");
    const approved = applications.filter((a) => a.status === "approved");
    const withResponse = submitted.filter((a) => a.responseDays != null);
    const avgResponse =
      withResponse.length > 0
        ? withResponse.reduce((s, a) => s + (a.responseDays ?? 0), 0) / withResponse.length
        : 0;
    const approvalRate = submitted.length > 0 ? (approved.length / submitted.length) * 100 : 0;

    const byLender = Object.entries(
      applications.reduce<Record<string, number>>((acc, a) => {
        acc[a.lender] = (acc[a.lender] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const byOwner = Object.entries(
      applications.reduce<Record<string, number>>((acc, a) => {
        acc[a.assignedUser] = (acc[a.assignedUser] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const needsFollowUp = applications.filter(
      (a) =>
        (a.status === "submitted" || a.status === "under-review") &&
        (a.responseDays ?? 0) >= 3,
    ).length;

    return { submitted: submitted.length, approvalRate, avgResponse, byLender, byOwner, needsFollowUp };
  }, [applications]);

  const appsByStatus = useMemo(() => {
    const map = Object.fromEntries(
      APPLICATION_STATUSES.map((s) => [s.id, [] as ApplicationRecord[]]),
    ) as Record<ApplicationStatus, ApplicationRecord[]>;
    for (const app of filtered) {
      map[app.status].push(app);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Submission Management"
        purpose="Track all lender submissions — which need follow-up, approval, or response?"
      />

      <div
        className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2.5"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Submitted" value={formatNumber(metrics.submitted)} />
          <MetricCard label="Approval Rate" value={`${metrics.approvalRate.toFixed(0)}%`} changePositive />
          <MetricCard label="Avg Response" value={`${metrics.avgResponse.toFixed(1)}d`} />
          <MetricCard label="Need Follow-Up" value={String(metrics.needsFollowUp)} highlight={metrics.needsFollowUp > 0} />
          <MetricCard
            label="Under Review"
            value={String(applications.filter((a) => a.status === "under-review").length)}
          />
        </div>
      </div>

      {metrics.needsFollowUp > 0 ? (
        <div
          className="flex shrink-0 items-center gap-2 border-b px-4 py-2"
          style={{ background: "var(--warning-subtle)", borderColor: "var(--border-default)" }}
        >
          <AlertCircle className="h-3.5 w-3.5" style={{ color: "var(--warning)" }} />
          <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>
            <strong>{metrics.needsFollowUp} applications</strong> have been waiting 3+ days without a lender response.
          </p>
        </div>
      ) : null}

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
            {APPLICATION_STATUSES.map((s) => (
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
            placeholder="Search applications..."
            className="w-40 bg-transparent text-[12px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "table" ? (
          <div className="h-full overflow-y-auto p-4 enterprise-scroll">
            <div className="grid gap-4 xl:grid-cols-4">
              <div className="xl:col-span-3">
                <PanelSection title="All Applications" description={`${filtered.length} records`}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-[12px]">
                      <thead>
                        <tr style={{ color: "var(--text-tertiary)" }}>
                          <th className="pb-2 pr-3 font-medium">Business</th>
                          <th className="pb-2 pr-3 font-medium">Lender</th>
                          <th className="pb-2 pr-3 font-medium">Status</th>
                          <th className="pb-2 pr-3 font-medium">Submitted</th>
                          <th className="pb-2 pr-3 font-medium">Owner</th>
                          <th className="pb-2 pr-3 text-right font-medium">Response</th>
                          <th className="pb-2 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((app) => (
                          <tr key={app.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                            <td className="py-2.5 pr-3 font-medium" style={{ color: "var(--text-primary)" }}>
                              {app.businessName}
                            </td>
                            <td className="py-2.5 pr-3" style={{ color: "var(--text-secondary)" }}>
                              {app.lender}
                            </td>
                            <td className="py-2.5 pr-3">
                              <ApplicationStatusBadge status={app.status} />
                            </td>
                            <td className="py-2.5 pr-3 tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                              {app.submissionDate ?? "—"}
                            </td>
                            <td className="py-2.5 pr-3">
                              <div className="flex items-center gap-1.5">
                                <OwnerAvatar name={app.assignedUser} />
                                <span style={{ color: "var(--text-secondary)" }}>{app.assignedUser}</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                              {app.responseDays != null ? `${app.responseDays}d` : "—"}
                            </td>
                            <td className="py-2.5 max-w-[180px] truncate" style={{ color: "var(--text-tertiary)" }}>
                              {app.notes ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </PanelSection>
              </div>

              <div className="space-y-4">
                <PanelSection title="By Lender">
                  <div className="space-y-2">
                    {metrics.byLender.map(([lender, count]) => (
                      <div key={lender} className="flex justify-between text-[12px]">
                        <span style={{ color: "var(--text-primary)" }}>{lender}</span>
                        <span className="tabular-nums font-medium" style={{ color: "var(--accent)" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </PanelSection>
                <PanelSection title="By Owner">
                  <div className="space-y-2">
                    {metrics.byOwner.map(([owner, count]) => (
                      <div key={owner} className="flex justify-between text-[12px]">
                        <span style={{ color: "var(--text-primary)" }}>{owner}</span>
                        <span className="tabular-nums font-medium" style={{ color: "var(--accent)" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </PanelSection>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full gap-3 overflow-x-auto p-4 enterprise-scroll">
            {APPLICATION_STATUSES.map(({ id, label }) => (
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
                    {appsByStatus[id].length}
                  </span>
                </div>
                <div className="space-y-2 overflow-y-auto p-2 enterprise-scroll" style={{ maxHeight: "calc(100vh - 320px)" }}>
                  {appsByStatus[id].map((app) => (
                    <ApplicationKanbanCard key={app.id} app={app} />
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
