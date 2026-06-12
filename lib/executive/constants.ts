import type { FinancialTab, InfrastructureTab } from "@/lib/executive/types";

export const FINANCIAL_TABS: { id: FinancialTab; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "expenses", label: "Expenses" },
  { id: "commissions", label: "Commissions" },
  { id: "forecasting", label: "Forecasting" },
];

export const INFRASTRUCTURE_TABS: { id: InfrastructureTab; label: string }[] = [
  { id: "platforms", label: "Platforms" },
  { id: "integrations", label: "Integrations" },
  { id: "domains", label: "Domains" },
  { id: "servers", label: "Servers" },
  { id: "api-keys", label: "API Keys" },
];

export const RISK_SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

export const RISK_CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales",
  marketing: "Marketing",
  finance: "Finance",
  infrastructure: "Infrastructure",
  operations: "Operations",
};
