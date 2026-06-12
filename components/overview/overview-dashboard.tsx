"use client";

import {
  AlertTriangle,
  Bot,
  DollarSign,
  FileText,
  Megaphone,
  Receipt,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type MetricWidget = {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: typeof DollarSign;
  highlight?: boolean;
};

const revenueMetrics: MetricWidget[] = [
  { label: "Revenue Today", value: "$12,400", change: "+8% vs yesterday", changePositive: true, icon: DollarSign },
  { label: "Revenue MTD", value: "$284,500", change: "+12% vs last month", changePositive: true, icon: TrendingUp, highlight: true },
  { label: "Commission Revenue", value: "$41,200", change: "MTD", icon: Receipt },
];

const pipelineMetrics: MetricWidget[] = [
  { label: "Leads Today", value: "47", change: "+15 vs avg", changePositive: true, icon: Users },
  { label: "Applications Submitted", value: "12", change: "Today", icon: FileText },
  { label: "Offers Received", value: "8", change: "Today", icon: Target },
  { label: "Deals Funded", value: "3", change: "Today", icon: Zap, highlight: true },
];

const marketingMetrics: MetricWidget[] = [
  { label: "Marketing Spend", value: "$4,820", change: "Today", icon: Megaphone },
  { label: "CAC", value: "$186", change: "-4% WoW", changePositive: true, icon: Target },
  { label: "ROAS", value: "3.2x", change: "+0.3 vs target", changePositive: true, icon: TrendingUp, highlight: true },
];

const opsMetrics: MetricWidget[] = [
  { label: "Active Blockers", value: "4", change: "2 critical", icon: AlertTriangle, highlight: true },
  { label: "Team Activity", value: "128", change: "Actions today", icon: Users },
  { label: "AI Agent Status", value: "6 / 6", change: "All operational", changePositive: true, icon: Bot },
];

function WidgetGrid({
  title,
  widgets,
}: {
  title: string;
  widgets: MetricWidget[];
}) {
  return (
    <section>
      <h2
        className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <article
              key={widget.label}
              className="rounded-lg border p-4"
              style={{
                background: "var(--bg-surface)",
                borderColor: widget.highlight ? "var(--accent)" : "var(--border-default)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: "var(--bg-muted)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                </div>
                {widget.highlight ? (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                  >
                    Live
                  </span>
                ) : null}
              </div>
              <p
                className="mt-3 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                {widget.label}
              </p>
              <p
                className="mt-1 text-2xl font-semibold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {widget.value}
              </p>
              {widget.change ? (
                <p
                  className="mt-1 text-[11px]"
                  style={{
                    color: widget.changePositive
                      ? "var(--success)"
                      : widget.highlight && widget.label === "Active Blockers"
                        ? "var(--danger)"
                        : "var(--text-tertiary)",
                  }}
                >
                  {widget.change}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OverviewDashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="h-full overflow-y-auto enterprise-scroll">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6">
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {today}
          </p>
          <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Company command center
          </h2>
          <p className="mt-1 max-w-2xl text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Real-time snapshot across marketing, sales, operations, and AI. Metrics will connect
            to live data as modules come online.
          </p>
        </div>

        <div className="space-y-8">
          <WidgetGrid title="Revenue" widgets={revenueMetrics} />
          <WidgetGrid title="Sales Pipeline" widgets={pipelineMetrics} />
          <WidgetGrid title="Marketing Efficiency" widgets={marketingMetrics} />
          <WidgetGrid title="Operations & AI" widgets={opsMetrics} />
        </div>

        <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Placeholder metrics · Connect integrations to populate live data
        </p>
      </div>
    </div>
  );
}
