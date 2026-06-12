export type ExecutiveMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  highlight?: boolean;
};

export type FinancialTab = "revenue" | "expenses" | "commissions" | "forecasting";

export type InfrastructureTab =
  | "platforms"
  | "integrations"
  | "domains"
  | "servers"
  | "api-keys";

export type PlatformStatus = "healthy" | "degraded" | "outage" | "maintenance";

export type PlatformRecord = {
  id: string;
  name: string;
  category: string;
  owner: string;
  monthlyCost: number;
  status: PlatformStatus;
  renewalDate?: string;
  notes?: string;
};

export type IntegrationRecord = {
  id: string;
  name: string;
  platform: string;
  status: "connected" | "error" | "disconnected";
  lastSync?: string;
  owner: string;
};

export type DomainRecord = {
  id: string;
  domain: string;
  registrar: string;
  expiresAt: string;
  autoRenew: boolean;
};

export type ServerRecord = {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: "online" | "degraded" | "offline";
  monthlyCost: number;
};

export type ApiKeyRecord = {
  id: string;
  service: string;
  owner: string;
  lastRotated?: string;
  expiresAt?: string;
  scope: string;
};

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export type RiskCategory =
  | "sales"
  | "marketing"
  | "finance"
  | "infrastructure"
  | "operations";

export type RiskItem = {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  detectedAt: string;
  owner?: string;
};

export type RevenueLine = {
  label: string;
  amount: number;
  priorPeriod: number;
};

export type ExpenseLine = {
  category: string;
  budget: number;
  actual: number;
};

export type CommissionRecord = {
  rep: string;
  fundedDeals: number;
  volume: number;
  commissionDue: number;
  status: "pending" | "approved" | "paid";
};

export type ForecastScenario = {
  label: string;
  month: string;
  projected: number;
  actual?: number;
  confidence: "high" | "medium" | "at-risk";
};
