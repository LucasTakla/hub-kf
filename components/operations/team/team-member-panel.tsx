"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { formatCurrency } from "@/components/marketing/shared/panel-section";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import { ModuleBadge } from "@/components/operations/shared/badges";
import { OwnerAvatar } from "@/components/sales/shared/badges";
import type { TeamDetailTab, TeamMember } from "@/lib/operations/types";

type TeamMemberPanelProps = {
  member: TeamMember | null;
  onClose: () => void;
};

const detailTabs: { id: TeamDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "workload", label: "Workload" },
  { id: "deals", label: "Deals" },
  { id: "applications", label: "Applications" },
  { id: "offers", label: "Offers" },
  { id: "roadmap", label: "Roadmap Tasks" },
  { id: "activity", label: "Activity" },
];

export function TeamMemberPanel({ member, onClose }: TeamMemberPanelProps) {
  const [activeTab, setActiveTab] = useState<TeamDetailTab>("overview");

  if (!member) return null;

  const totalWorkload =
    member.dealsOwned + member.applicationsManaged + member.offersManaged + member.openRoadmapTasks;

  return (
    <aside
      className="flex h-full w-[min(480px,42vw)] shrink-0 flex-col border-l"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
    >
      <div
        className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            {member.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {member.name}
            </h2>
            <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {member.role}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "var(--bg-muted)" }}
          aria-label="Close profile"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <ModuleTabs tabs={detailTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {member.email}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Deals Owned", value: member.dealsOwned },
                { label: "Applications", value: member.applicationsManaged },
                { label: "Offers", value: member.offersManaged },
                { label: "Roadmap Tasks", value: member.openRoadmapTasks },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md p-3 text-center"
                  style={{ background: "var(--bg-muted)" }}
                >
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Recent Activity
              </p>
              <ul className="mt-2 space-y-1.5">
                {member.recentActivity.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "workload" && (
          <div className="space-y-4">
            <div
              className="rounded-lg border p-4 text-center"
              style={{ borderColor: "var(--accent)", background: "var(--accent-subtle)" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Total Active Items
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {totalWorkload}
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Deals", value: member.dealsOwned, max: 20 },
                { label: "Applications", value: member.applicationsManaged, max: 50 },
                { label: "Offers", value: member.offersManaged, max: 15 },
                { label: "Roadmap Tasks", value: member.openRoadmapTasks, max: 10 },
              ].map(({ label, value, max }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span style={{ color: "var(--text-primary)" }}>{label}</span>
                    <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (value / max) * 100)}%`,
                        background: value / max > 0.8 ? "var(--warning)" : "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "deals" && (
          <div className="space-y-2">
            {member.assignedDeals.map((deal) => (
              <div
                key={deal.name}
                className="rounded-md border p-3"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {deal.name}
                </p>
                <div className="mt-1 flex justify-between text-[11px]">
                  <span style={{ color: "var(--text-tertiary)" }}>{deal.stage}</span>
                  <span className="font-medium tabular-nums" style={{ color: "var(--accent)" }}>
                    {formatCurrency(deal.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-2">
            {member.assignedApplications.map((app) => (
              <div
                key={`${app.business}-${app.lender}`}
                className="rounded-md border p-3"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {app.business}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  {app.lender} · {app.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "offers" && (
          <div className="space-y-2">
            {member.assignedOffers.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No offers assigned
              </p>
            ) : (
              member.assignedOffers.map((offer) => (
                <div
                  key={`${offer.business}-${offer.lender}`}
                  className="rounded-md border p-3"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {offer.business}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {offer.lender} · {formatCurrency(offer.amount)} · {offer.status}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "roadmap" && (
          <div className="space-y-2">
            <p className="mb-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Tasks tracked in Roadmap — not duplicated here as a task manager
            </p>
            {member.roadmapTasks.map((task) => (
              <div
                key={task.title}
                className="rounded-md border p-3"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {task.title}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {task.status} · Due {task.dueDate}
                </p>
              </div>
            ))}
            <a
              href="/roadmap"
              className="mt-2 inline-block text-[11px] font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              View in Roadmap →
            </a>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {member.activityFeed.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No recent activity
              </p>
            ) : (
              member.activityFeed.map((event) => (
                <div key={event.id} className="flex gap-2">
                  <ModuleBadge module={event.module} />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {event.title}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
