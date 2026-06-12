"use client";

import { MetricCard } from "@/components/marketing/shared/metric-card";
import { ModuleHeader, PanelSection, formatCurrency } from "@/components/marketing/shared/panel-section";
import { overviewMetrics, revenueLines } from "@/lib/executive/mock-data";

export function OverviewWorkspace() {
  const totalRevenue = revenueLines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Leadership overview"
        purpose="High-level view of company performance — revenue, pipeline, spend, and forecast at a glance"
      />

      <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {overviewMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              changePositive={metric.changePositive}
              highlight={metric.highlight}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PanelSection
            title="Revenue composition"
            description="MTD breakdown by revenue stream"
          >
            <ul className="space-y-2.5">
              {revenueLines.map((line) => {
                const delta = line.amount - line.priorPeriod;
                const deltaPct = ((delta / line.priorPeriod) * 100).toFixed(1);
                return (
                  <li
                    key={line.label}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5"
                    style={{ background: "var(--bg-muted)" }}
                  >
                    <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                      {line.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(line.amount)}
                      </p>
                      <p
                        className="text-[10px] tabular-nums"
                        style={{ color: delta >= 0 ? "var(--success)" : "var(--danger)" }}
                      >
                        {delta >= 0 ? "+" : ""}
                        {deltaPct}% vs prior
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] font-medium tabular-nums" style={{ color: "var(--text-secondary)" }}>
              Total MTD: {formatCurrency(totalRevenue)}
            </p>
          </PanelSection>

          <PanelSection
            title="Executive signals"
            description="What leadership should watch this week"
          >
            <ul className="space-y-2">
              {[
                "Pipeline velocity is up 9% — 12 deals entered underwriting",
                "Marketing spend at 82% of budget with 18 days remaining",
                "5 offers expiring within 7 days need rep follow-up",
                "Twilio integration errors may impact SMS follow-ups",
              ].map((signal) => (
                <li
                  key={signal}
                  className="rounded-md border px-3 py-2 text-[12px]"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {signal}
                </li>
              ))}
            </ul>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}
