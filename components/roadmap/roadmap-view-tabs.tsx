"use client";

import { Kanban, Layers, GanttChart } from "lucide-react";

import type { RoadmapView } from "@/lib/roadmap-constants";

type RoadmapViewTabsProps = {
  activeView: RoadmapView;
  onViewChange: (view: RoadmapView) => void;
};

const views: { id: RoadmapView; label: string; description: string; icon: typeof Kanban }[] = [
  {
    id: "board",
    label: "Board",
    description: "Daily execution",
    icon: Kanban,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Planning & scheduling",
    icon: GanttChart,
  },
  {
    id: "releases",
    label: "Releases",
    description: "Executive overview",
    icon: Layers,
  },
];

export function RoadmapViewTabs({ activeView, onViewChange }: RoadmapViewTabsProps) {
  return (
    <div
      className="flex items-center gap-1 border-b px-4"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {views.map(({ id, label, description, icon: Icon }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            className="relative flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium transition-colors"
            style={{
              color: active ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            <span
              className="hidden text-[10px] font-normal sm:inline"
              style={{ color: "var(--text-tertiary)" }}
            >
              {description}
            </span>
            {active ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5"
                style={{ background: "var(--accent)" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
