import type { RoadmapMetrics } from "@/lib/roadmap";

type RoadmapMetricsBarProps = {
  metrics: RoadmapMetrics;
};

function MetricCell({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col justify-center border-r px-4 py-3 last:border-r-0"
      style={{ borderColor: "var(--border-default)" }}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>
      <span
        className="mt-1 text-xl font-semibold tabular-nums"
        style={{ color: highlight ? "var(--accent)" : "var(--text-primary)" }}
      >
        {value}
        {suffix ? (
          <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
            {suffix}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function RoadmapMetricsBar({ metrics }: RoadmapMetricsBarProps) {
  return (
    <div
      className="grid grid-cols-2 border-b md:grid-cols-3 xl:grid-cols-6"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <MetricCell label="Product health" value={metrics.healthScore} suffix="/100" highlight />
      <MetricCell label="In progress" value={metrics.inProgress} />
      <MetricCell label="Delayed" value={metrics.delayedCount} highlight={metrics.delayedCount > 0} />
      <MetricCell label="At risk" value={metrics.atRiskCount} highlight={metrics.atRiskCount > 0} />
      <MetricCell label="Recent activity" value={metrics.recentActivityCount} />
    </div>
  );
}
