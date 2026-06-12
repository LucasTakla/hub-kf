import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  highlight?: boolean;
  icon?: ReactNode;
};

export function MetricCard({
  label,
  value,
  change,
  changePositive,
  highlight,
  icon,
}: MetricCardProps) {
  return (
    <article
      className="rounded-lg border p-3.5"
      style={{
        background: "var(--bg-surface)",
        borderColor: highlight ? "var(--accent)" : "var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          {label}
        </p>
        {icon}
      </div>
      <p
        className="mt-1.5 text-xl font-semibold tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      {change ? (
        <p
          className="mt-0.5 text-[11px]"
          style={{
            color: changePositive ? "var(--success)" : "var(--text-tertiary)",
          }}
        >
          {change}
        </p>
      ) : null}
    </article>
  );
}
