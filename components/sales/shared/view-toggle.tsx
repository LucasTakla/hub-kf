"use client";

import { Columns3, Table2 } from "lucide-react";

export type WorkspaceView = "table" | "kanban";

type ViewToggleProps = {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
};

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-md border p-0.5"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
    >
      {(
        [
          { id: "table" as const, label: "Table", icon: Table2 },
          { id: "kanban" as const, label: "Kanban", icon: Columns3 },
        ] as const
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onViewChange(id)}
          className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors"
          style={{
            background: view === id ? "var(--bg-surface)" : "transparent",
            color: view === id ? "var(--text-primary)" : "var(--text-tertiary)",
          }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
