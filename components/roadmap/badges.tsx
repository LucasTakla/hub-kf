import type { RoadmapConfidence, RoadmapPriority, RoadmapStatus } from "@prisma/client";

export function PriorityBadge({ priority }: { priority: RoadmapPriority }) {
  const styles: Record<RoadmapPriority, { bg: string; color: string }> = {
    P0: { bg: "var(--danger-subtle)", color: "var(--danger)" },
    P1: { bg: "var(--warning-subtle)", color: "var(--warning)" },
    P2: { bg: "var(--bg-muted)", color: "var(--text-secondary)" },
  };

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: styles[priority].bg, color: styles[priority].color }}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: RoadmapStatus }) {
  const labels: Record<RoadmapStatus, string> = {
    PLANNED: "Planned",
    IN_PROGRESS: "In progress",
    DONE: "Done",
  };

  const styles: Record<RoadmapStatus, { bg: string; color: string }> = {
    PLANNED: { bg: "var(--bg-muted)", color: "var(--text-secondary)" },
    IN_PROGRESS: { bg: "var(--accent-subtle)", color: "var(--accent)" },
    DONE: { bg: "var(--success-subtle)", color: "var(--success)" },
  };

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: styles[status].bg, color: styles[status].color }}
    >
      {labels[status]}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: RoadmapConfidence }) {
  const labels: Record<RoadmapConfidence, string> = {
    HIGH: "High confidence",
    MEDIUM: "Medium",
    AT_RISK: "At risk",
  };

  const styles: Record<RoadmapConfidence, { bg: string; color: string }> = {
    HIGH: { bg: "var(--success-subtle)", color: "var(--success)" },
    MEDIUM: { bg: "var(--warning-subtle)", color: "var(--warning)" },
    AT_RISK: { bg: "var(--danger-subtle)", color: "var(--danger)" },
  };

  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: styles[confidence].bg, color: styles[confidence].color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: styles[confidence].color }}
      />
      {labels[confidence]}
    </span>
  );
}

export function TeamAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ background: "var(--accent)" }}
      title={name}
    >
      {initials}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full"
      style={{ background: "var(--border-default)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: "var(--accent)",
        }}
      />
    </div>
  );
}
