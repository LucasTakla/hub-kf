"use client";

import type {
  RoadmapPriority,
  RoadmapStatus,
} from "@prisma/client";
import { Filter, Plus, Search } from "lucide-react";

import type { RoadmapView } from "@/lib/roadmap-constants";
import { TEAMS } from "@/lib/roadmap-constants";

type RoadmapToolbarProps = {
  view: RoadmapView;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RoadmapStatus | "ALL";
  onStatusFilterChange: (value: RoadmapStatus | "ALL") => void;
  priorityFilter: RoadmapPriority | "ALL";
  onPriorityFilterChange: (value: RoadmapPriority | "ALL") => void;
  teamFilter: string;
  onTeamFilterChange: (value: string) => void;
  resultCount: number;
  onNewRelease: () => void;
};

const statuses: Array<RoadmapStatus | "ALL"> = ["ALL", "PLANNED", "IN_PROGRESS", "DONE"];
const priorities: Array<RoadmapPriority | "ALL"> = ["ALL", "P0", "P1", "P2"];

const searchPlaceholders: Record<RoadmapView, string> = {
  board: "Search tasks...",
  timeline: "Search tasks & releases...",
  releases: "Search releases...",
};

export function RoadmapToolbar({
  view,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  teamFilter,
  onTeamFilterChange,
  resultCount,
  onNewRelease,
}: RoadmapToolbarProps) {
  const showTaskFilters = view === "board" || view === "timeline";

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="flex min-w-[200px] flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5"
        style={{
          background: "var(--bg-muted)",
          borderColor: "var(--border-default)",
        }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholders[view]}
          className="w-full bg-transparent text-[12px] outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {showTaskFilters ? (
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />

          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as RoadmapStatus | "ALL")}
            className="rounded-md border px-2 py-1.5 text-[11px] font-medium outline-none"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              onPriorityFilterChange(event.target.value as RoadmapPriority | "ALL")
            }
            className="rounded-md border px-2 py-1.5 text-[11px] font-medium outline-none"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "ALL" ? "All priorities" : priority}
              </option>
            ))}
          </select>

          <select
            value={teamFilter}
            onChange={(event) => onTeamFilterChange(event.target.value)}
            className="rounded-md border px-2 py-1.5 text-[11px] font-medium outline-none"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="ALL">All teams</option>
            {TEAMS.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        {view === "releases" ? `${resultCount} releases` : `${resultCount} tasks`}
      </span>

      <button
        type="button"
        onClick={onNewRelease}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-white"
        style={{ background: "var(--accent)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        New Release
      </button>
    </div>
  );
}
