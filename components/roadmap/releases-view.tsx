"use client";

import type { Release, RoadmapItem } from "@prisma/client";
import { AlertTriangle, Ban, Calendar, Clock, Settings2 } from "lucide-react";
import { useMemo } from "react";

import { ProgressBar } from "@/components/roadmap/badges";
import { formatDate } from "@/lib/format";
import {
  buildReleaseSummaries,
  type ReleaseSummary,
} from "@/lib/roadmap-insights";

type ReleasesViewProps = {
  releases: Release[];
  items: RoadmapItem[];
  onEditRelease: (release: Release) => void;
  onSelectItem: (itemId: string) => void;
};

const statusLabels = {
  complete: "Complete",
  "on-track": "On track",
  "at-risk": "At risk",
  planned: "Planned",
} as const;

const statusColors = {
  complete: "var(--success)",
  "on-track": "var(--accent)",
  "at-risk": "var(--danger)",
  planned: "var(--text-tertiary)",
} as const;

function ReleaseCard({
  summary,
  onEditRelease,
  onSelectItem,
  items,
}: {
  summary: ReleaseSummary;
  onEditRelease: (release: Release) => void;
  onSelectItem: (itemId: string) => void;
  items: RoadmapItem[];
}) {
  const { release } = summary;
  const releaseItems = items.filter((i) => i.lane === release.slug);
  const blockers = releaseItems.filter(
    (i) =>
      i.status !== "DONE" &&
      i.dependsOnIds &&
      i.dependsOnIds.split(",").some((depId) => {
        const dep = items.find((d) => d.id === depId.trim());
        return dep && dep.status !== "DONE";
      }),
  );
  const atRiskItems = releaseItems.filter(
    (i) => i.confidence === "AT_RISK" && i.status !== "DONE",
  );

  return (
    <article
      className="rounded-lg border"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="flex items-start justify-between gap-4 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ background: release.color ?? "var(--accent)" }}
          />
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {release.label}
            </h3>
            {release.subtitle ? (
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                {release.subtitle}
              </p>
            ) : null}
            {release.owner ? (
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Owner: {release.owner}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: `color-mix(in srgb, ${statusColors[summary.status]} 15%, transparent)`,
              color: statusColors[summary.status],
            }}
          >
            {statusLabels[summary.status]}
          </span>
          <button
            type="button"
            onClick={() => onEditRelease(release)}
            className="rounded p-1"
            aria-label="Edit release"
          >
            <Settings2 className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--text-tertiary)" }}>Delivery progress</span>
              <span className="font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
                {summary.progress}%
              </span>
            </div>
            <ProgressBar value={summary.progress} />
            <div className="mt-2 flex gap-4 text-[11px]" style={{ color: "var(--text-secondary)" }}>
              <span>{summary.doneTasks} done</span>
              <span>{summary.inProgressTasks} in progress</span>
              <span>{summary.plannedTasks} planned</span>
              <span>{summary.totalTasks} total</span>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3 rounded-lg border p-3"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
          >
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                <Ban className="h-3 w-3" />
                Blockers
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: summary.blockers > 0 ? "var(--danger)" : "var(--text-primary)" }}>
                {summary.blockers}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                <Clock className="h-3 w-3" />
                Delays
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: summary.delays > 0 ? "var(--danger)" : "var(--text-primary)" }}>
                {summary.delays}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                <AlertTriangle className="h-3 w-3" />
                At risk
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: summary.atRisk > 0 ? "var(--warning)" : "var(--text-primary)" }}>
                {summary.atRisk}
              </p>
            </div>
          </div>

          {(blockers.length > 0 || atRiskItems.length > 0) && (
            <div className="mt-3 space-y-1">
              {blockers.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  className="block w-full truncate rounded px-2 py-1 text-left text-[11px] hover:opacity-80"
                  style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", color: "var(--danger)" }}
                >
                  Blocked: {item.title}
                </button>
              ))}
              {atRiskItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  className="block w-full truncate rounded px-2 py-1 text-left text-[11px] hover:opacity-80"
                  style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)", color: "var(--warning)" }}
                >
                  At risk: {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-lg border p-3"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
        >
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <Calendar className="h-3 w-3" />
            Milestones
          </div>
          <dl className="space-y-2 text-[12px]">
            <div className="flex justify-between gap-2">
              <dt style={{ color: "var(--text-tertiary)" }}>Start</dt>
              <dd className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {formatDate(release.startDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt style={{ color: "var(--text-tertiary)" }}>Target</dt>
              <dd className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {formatDate(release.targetDate)}
              </dd>
            </div>
            {release.completedAt ? (
              <div className="flex justify-between gap-2">
                <dt style={{ color: "var(--text-tertiary)" }}>Completed</dt>
                <dd className="tabular-nums" style={{ color: "var(--success)" }}>
                  {formatDate(release.completedAt)}
                </dd>
              </div>
            ) : (
              <div className="flex justify-between gap-2">
                <dt style={{ color: "var(--text-tertiary)" }}>Days to target</dt>
                <dd
                  className="tabular-nums font-medium"
                  style={{
                    color:
                      summary.daysUntilTarget < 0
                        ? "var(--danger)"
                        : summary.daysUntilTarget <= 14
                          ? "var(--warning)"
                          : "var(--text-secondary)",
                  }}
                >
                  {summary.daysUntilTarget < 0
                    ? `${Math.abs(summary.daysUntilTarget)}d overdue`
                    : `${summary.daysUntilTarget}d remaining`}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Confidence
            </p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
              {summary.highConfidence} high · {summary.atRisk} at risk
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ReleasesView({
  releases,
  items,
  onEditRelease,
  onSelectItem,
}: ReleasesViewProps) {
  const summaries = useMemo(
    () => buildReleaseSummaries(releases, items),
    [releases, items],
  );

  if (summaries.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8 text-[13px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        No releases yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
      <div className="mx-auto max-w-5xl space-y-4">
        {summaries.map((summary) => (
          <ReleaseCard
            key={summary.release.slug}
            summary={summary}
            items={items}
            onEditRelease={onEditRelease}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
}
