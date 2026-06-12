"use client";

import type { RoadmapItem } from "@prisma/client";
import { GripVertical } from "lucide-react";

import { PriorityBadge, ProgressBar, StatusBadge, TeamAvatar } from "@/components/roadmap/badges";
import { formatDate } from "@/lib/format";
import { toDate } from "@/lib/roadmap";

type FeatureCardProps = {
  item: RoadmapItem;
  isSelected: boolean;
  onSelect: (item: RoadmapItem) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

export function FeatureCard({
  item,
  isSelected,
  onSelect,
  dragHandleProps,
}: FeatureCardProps) {
  const isOverdue = item.status !== "DONE" && toDate(item.targetDate).getTime() < Date.now();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
      className="group cursor-pointer rounded-md border px-3 py-2.5 transition-colors"
      style={{
        background: isSelected ? "var(--accent-subtle)" : "var(--bg-surface)",
        borderColor: isSelected ? "var(--accent)" : "var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="flex-1 text-[13px] font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {item.title}
        </h3>
        <button
          type="button"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          {...dragHandleProps}
          onClick={(event) => event.stopPropagation()}
          aria-label="Drag feature"
        >
          <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <StatusBadge status={item.status} />
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ProgressBar value={item.progress} />
        <span
          className="shrink-0 text-[11px] font-medium tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {item.progress}%
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {item.owner ? <TeamAvatar name={item.owner} /> : null}
          <span className="truncate text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {item.owner ?? "Unassigned"}
          </span>
        </div>
        <span
          className="shrink-0 text-[11px] tabular-nums"
          style={{ color: isOverdue ? "var(--danger)" : "var(--text-tertiary)" }}
        >
          {formatDate(item.targetDate)}
        </span>
      </div>
    </article>
  );
}
