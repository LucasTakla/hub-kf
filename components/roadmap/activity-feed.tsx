"use client";

import type { ActivityType, Release, RoadmapActivity, RoadmapItem } from "@prisma/client";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Rocket,
  Radio,
} from "lucide-react";
import { useMemo } from "react";

import { formatDate } from "@/lib/format";
import {
  buildOperationalInsights,
  type InsightItem,
} from "@/lib/roadmap-insights";

type ActivityFeedProps = {
  items: RoadmapItem[];
  activities: RoadmapActivity[];
  releases: Release[];
  onSelectItem?: (itemId: string) => void;
};

const sectionIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  blockers: Ban,
  delays: Clock,
  risks: AlertTriangle,
  shipping: Rocket,
  completed: CheckCircle2,
  updates: Radio,
};

const typeColors: Record<ActivityType, string> = {
  BLOCKER: "var(--danger)",
  DELAY: "var(--danger)",
  RISK: "var(--warning)",
  COMPLETED: "var(--success)",
  SHIPPING: "var(--accent)",
  UPDATE: "var(--text-tertiary)",
};

function InsightRow({
  insight,
  onSelect,
}: {
  insight: InsightItem;
  onSelect?: (itemId: string) => void;
}) {
  const clickable = Boolean(onSelect && insight.itemId);

  return (
    <li className="rounded-md px-2 py-2 transition-colors">
      <button
        type="button"
        disabled={!clickable}
        onClick={() => insight.itemId && onSelect?.(insight.itemId)}
        className="w-full text-left"
      >
        <p
          className="text-[12px] font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {insight.title}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: typeColors[insight.type] }}>
          {insight.message}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {insight.releaseLabel ? <span>{insight.releaseLabel}</span> : null}
          {insight.dueDate ? <span>{formatDate(insight.dueDate)}</span> : null}
        </div>
      </button>
    </li>
  );
}

export function ActivityFeed({
  items,
  activities,
  releases,
  onSelectItem,
}: ActivityFeedProps) {
  const sections = useMemo(
    () => buildOperationalInsights(items, activities, releases),
    [items, activities, releases],
  );

  const hasIssues = sections.some(
    (s) => s.id === "blockers" || s.id === "delays" || s.id === "risks",
  );

  return (
    <div
      className="flex h-full flex-col border-l"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="border-b px-4 py-3"
        style={{ borderColor: "var(--border-default)" }}
      >
        <h3 className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Operational pulse
        </h3>
        <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {hasIssues ? "Items need attention" : "Everything on track"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 enterprise-scroll">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            No active issues. All releases on track.
          </p>
        ) : (
          sections.map((section) => {
            const Icon = sectionIcons[section.id] ?? Radio;
            return (
              <section key={section.id} className="mb-4">
                <div className="mb-1.5 flex items-center gap-1.5 px-2">
                  <Icon className="h-3 w-3" style={{ color: "var(--text-tertiary)" }} />
                  <h4
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {section.label}
                    <span className="ml-1 font-normal">({section.items.length})</span>
                  </h4>
                </div>
                <ul className="space-y-0.5">
                  {section.items.map((insight) => (
                    <InsightRow
                      key={insight.id}
                      insight={insight}
                      onSelect={onSelectItem}
                    />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
