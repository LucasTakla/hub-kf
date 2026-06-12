"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { ModuleHeader, PanelSection } from "@/components/marketing/shared/panel-section";
import { RISK_CATEGORY_LABELS, RISK_SEVERITY_ORDER } from "@/lib/executive/constants";
import { riskItems } from "@/lib/executive/mock-data";
import type { RiskCategory, RiskSeverity } from "@/lib/executive/types";

function severityColor(severity: RiskSeverity) {
  switch (severity) {
    case "critical":
      return "var(--danger)";
    case "high":
      return "var(--warning, #d97706)";
    case "medium":
      return "var(--accent)";
    default:
      return "var(--text-tertiary)";
  }
}

function formatDetectedAt(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RisksWorkspace() {
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | "all">("all");

  const counts = useMemo(() => {
    const bySeverity: Record<string, number> = {};
    for (const severity of RISK_SEVERITY_ORDER) {
      bySeverity[severity] = riskItems.filter((r) => r.severity === severity).length;
    }
    return bySeverity;
  }, []);

  const filtered = useMemo(() => {
    return riskItems
      .filter((item) => severityFilter === "all" || item.severity === severityFilter)
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .sort((a, b) => {
        const severityDiff =
          RISK_SEVERITY_ORDER.indexOf(a.severity) - RISK_SEVERITY_ORDER.indexOf(b.severity);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });
  }, [severityFilter, categoryFilter]);

  const criticalCount = counts.critical ?? 0;
  const highCount = counts.high ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Risk center"
        purpose="Centralized company risks — sales, marketing, finance, infrastructure, and operations"
      />

      <div
        className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          {filtered.length} active risk{filtered.length === 1 ? "" : "s"}
        </span>
        {criticalCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}
          >
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} critical
          </span>
        ) : null}
        {highCount > 0 ? (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "color-mix(in srgb, var(--warning, #d97706) 15%, transparent)", color: "var(--warning, #d97706)" }}
          >
            {highCount} high
          </span>
        ) : null}

        <div className="ml-auto flex flex-wrap gap-1.5">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | "all")}
            className="rounded-md border px-2 py-1 text-[11px]"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="all">All severities</option>
            {RISK_SEVERITY_ORDER.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RiskCategory | "all")}
            className="rounded-md border px-2 py-1 text-[11px]"
            style={{
              background: "var(--bg-muted)",
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="all">All categories</option>
            {Object.entries(RISK_CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
        <PanelSection title="Active risks" description="Issues requiring leadership visibility or action">
          <ul className="space-y-2">
            {filtered.map((risk) => (
              <li
                key={risk.id}
                className="rounded-lg border px-3 py-3"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {risk.title}
                    </p>
                    <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                      {risk.description}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      color: severityColor(risk.severity),
                      background: `color-mix(in srgb, ${severityColor(risk.severity)} 12%, transparent)`,
                    }}
                  >
                    {risk.severity}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>{RISK_CATEGORY_LABELS[risk.category]}</span>
                  <span>Detected {formatDetectedAt(risk.detectedAt)}</span>
                  {risk.owner ? <span>Owner: {risk.owner}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </PanelSection>
      </div>
    </div>
  );
}
