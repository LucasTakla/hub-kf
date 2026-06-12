"use client";

import { useState } from "react";

import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import { ModuleHeader, PanelSection, formatCurrency } from "@/components/marketing/shared/panel-section";
import { FINANCIAL_TABS } from "@/lib/executive/constants";
import {
  commissionRecords,
  expenseLines,
  forecastScenarios,
  revenueLines,
} from "@/lib/executive/mock-data";
import type { FinancialTab } from "@/lib/executive/types";

function RevenueTab() {
  const total = revenueLines.reduce((sum, line) => sum + line.amount, 0);
  return (
    <PanelSection title="Revenue breakdown" description="MTD revenue by stream">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 font-medium">Stream</th>
              <th className="pb-2 font-medium text-right">MTD</th>
              <th className="pb-2 font-medium text-right">Prior period</th>
              <th className="pb-2 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {revenueLines.map((line) => {
              const delta = line.amount - line.priorPeriod;
              return (
                <tr key={line.label} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="py-2" style={{ color: "var(--text-primary)" }}>{line.label}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                  <td className="py-2 text-right tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {formatCurrency(line.priorPeriod)}
                  </td>
                  <td
                    className="py-2 text-right tabular-nums"
                    style={{ color: delta >= 0 ? "var(--success)" : "var(--danger)" }}
                  >
                    {delta >= 0 ? "+" : ""}
                    {formatCurrency(delta)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold" style={{ borderColor: "var(--border-default)" }}>
              <td className="pt-2">Total</td>
              <td className="pt-2 text-right tabular-nums">{formatCurrency(total)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </PanelSection>
  );
}

function ExpensesTab() {
  const totalBudget = expenseLines.reduce((sum, line) => sum + line.budget, 0);
  const totalActual = expenseLines.reduce((sum, line) => sum + line.actual, 0);
  return (
    <PanelSection title="Operating expenses" description="Budget vs actual MTD">
      <ul className="space-y-2">
        {expenseLines.map((line) => {
          const pct = Math.round((line.actual / line.budget) * 100);
          const over = line.actual > line.budget;
          return (
            <li key={line.category}>
              <div className="mb-1 flex justify-between text-[12px]">
                <span style={{ color: "var(--text-primary)" }}>{line.category}</span>
                <span className="tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {formatCurrency(line.actual)} / {formatCurrency(line.budget)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bg-muted)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: over ? "var(--danger)" : "var(--accent)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
        Total: {formatCurrency(totalActual)} of {formatCurrency(totalBudget)} budget (
        {Math.round((totalActual / totalBudget) * 100)}%)
      </p>
    </PanelSection>
  );
}

function CommissionsTab() {
  return (
    <PanelSection title="Commission ledger" description="Rep payouts tied to funded deals">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 font-medium">Rep</th>
              <th className="pb-2 font-medium text-right">Funded</th>
              <th className="pb-2 font-medium text-right">Volume</th>
              <th className="pb-2 font-medium text-right">Due</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissionRecords.map((record) => (
              <tr key={record.rep} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="py-2" style={{ color: "var(--text-primary)" }}>{record.rep}</td>
                <td className="py-2 text-right tabular-nums">{record.fundedDeals}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(record.volume)}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(record.commissionDue)}</td>
                <td className="py-2 text-right capitalize" style={{ color: "var(--text-secondary)" }}>
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelSection>
  );
}

function ForecastingTab() {
  return (
    <PanelSection title="Revenue forecast" description="Scenario planning and confidence levels">
      <div className="space-y-2">
        {forecastScenarios.map((scenario, index) => (
          <div
            key={`${scenario.label}-${scenario.month}-${index}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div>
              <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                {scenario.label} — {scenario.month}
              </p>
              <p className="text-[10px] capitalize" style={{ color: "var(--text-tertiary)" }}>
                Confidence: {scenario.confidence}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(scenario.projected)}
              </p>
              {scenario.actual !== undefined ? (
                <p className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  Actual MTD: {formatCurrency(scenario.actual)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </PanelSection>
  );
}

const tabPanels: Record<FinancialTab, React.ComponentType> = {
  revenue: RevenueTab,
  expenses: ExpensesTab,
  commissions: CommissionsTab,
  forecasting: ForecastingTab,
};

export function FinancialsWorkspace() {
  const [activeTab, setActiveTab] = useState<FinancialTab>("revenue");
  const Panel = tabPanels[activeTab];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Financials"
        purpose="Revenue, expenses, commissions, and forecasting in one leadership view"
      />
      <ModuleTabs tabs={FINANCIAL_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
        <Panel />
      </div>
    </div>
  );
}
