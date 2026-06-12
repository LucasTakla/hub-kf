import type {
  ApiKeyRecord,
  CommissionRecord,
  DomainRecord,
  ExecutiveMetric,
  ExpenseLine,
  ForecastScenario,
  IntegrationRecord,
  PlatformRecord,
  RevenueLine,
  RiskItem,
  ServerRecord,
} from "@/lib/executive/types";

export const overviewMetrics: ExecutiveMetric[] = [
  {
    id: "revenue-mtd",
    label: "Revenue MTD",
    value: "$284,500",
    change: "+12.4% vs last month",
    changePositive: true,
    highlight: true,
  },
  {
    id: "funded-deals",
    label: "Funded Deals",
    value: "18",
    change: "+3 this week",
    changePositive: true,
  },
  {
    id: "active-deals",
    label: "Active Deals",
    value: "47",
    change: "12 in underwriting",
  },
  {
    id: "applications",
    label: "Applications",
    value: "63",
    change: "8 pending lender response",
  },
  {
    id: "offers",
    label: "Offers",
    value: "24",
    change: "5 expiring within 7 days",
    changePositive: false,
  },
  {
    id: "marketing-spend",
    label: "Marketing Spend",
    value: "$42,800",
    change: "82% of monthly budget",
  },
  {
    id: "cash-position",
    label: "Cash Position",
    value: "$1.24M",
    change: "Stable — 4.2 months runway",
    changePositive: true,
  },
  {
    id: "revenue-forecast",
    label: "Revenue Forecast",
    value: "$410K",
    change: "Projected month-end",
    changePositive: true,
  },
];

export const revenueLines: RevenueLine[] = [
  { label: "Origination fees", amount: 198400, priorPeriod: 176200 },
  { label: "Broker commissions (net)", amount: 52100, priorPeriod: 48200 },
  { label: "Renewals & upsells", amount: 24000, priorPeriod: 21800 },
  { label: "Partner referrals", amount: 10000, priorPeriod: 8400 },
];

export const expenseLines: ExpenseLine[] = [
  { category: "Marketing & ads", budget: 52000, actual: 42800 },
  { category: "Software & platforms", budget: 18400, actual: 19200 },
  { category: "Commissions payable", budget: 68000, actual: 61400 },
  { category: "Payroll", budget: 95000, actual: 95000 },
  { category: "Infrastructure & hosting", budget: 4200, actual: 3800 },
];

export const commissionRecords: CommissionRecord[] = [
  { rep: "Sarah Chen", fundedDeals: 6, volume: 840000, commissionDue: 12600, status: "approved" },
  { rep: "Marcus Webb", fundedDeals: 5, volume: 620000, commissionDue: 9300, status: "pending" },
  { rep: "Elena Ruiz", fundedDeals: 4, volume: 510000, commissionDue: 7650, status: "paid" },
  { rep: "Jordan Blake", fundedDeals: 3, volume: 380000, commissionDue: 5700, status: "pending" },
];

export const forecastScenarios: ForecastScenario[] = [
  { label: "Conservative", month: "Jun 2026", projected: 360000, actual: 284500, confidence: "high" },
  { label: "Base case", month: "Jun 2026", projected: 410000, confidence: "medium" },
  { label: "Stretch", month: "Jun 2026", projected: 468000, confidence: "at-risk" },
  { label: "Base case", month: "Jul 2026", projected: 445000, confidence: "medium" },
];

export const platforms: PlatformRecord[] = [
  { id: "meta", name: "Meta Ads", category: "Advertising", owner: "Marketing", monthlyCost: 0, status: "healthy", notes: "Ad spend billed separately" },
  { id: "ghl", name: "Go High Level", category: "CRM & automation", owner: "Operations", monthlyCost: 497, status: "healthy", renewalDate: "2026-08-01" },
  { id: "ringcentral", name: "RingCentral", category: "Communications", owner: "Sales", monthlyCost: 890, status: "healthy", renewalDate: "2026-09-15" },
  { id: "twilio", name: "Twilio", category: "SMS & voice", owner: "Operations", monthlyCost: 340, status: "degraded", notes: "Elevated error rate on SMS delivery" },
  { id: "openai", name: "OpenAI", category: "AI", owner: "AI", monthlyCost: 620, status: "healthy" },
  { id: "anthropic", name: "Anthropic", category: "AI", owner: "AI", monthlyCost: 480, status: "healthy" },
  { id: "cloudflare", name: "Cloudflare", category: "DNS & security", owner: "Infrastructure", monthlyCost: 250, status: "healthy", renewalDate: "2026-11-01" },
  { id: "hostinger", name: "Hostinger", category: "Hosting", owner: "Infrastructure", monthlyCost: 89, status: "healthy", renewalDate: "2026-07-20" },
  { id: "google", name: "Google Workspace", category: "Productivity", owner: "Operations", monthlyCost: 432, status: "healthy", renewalDate: "2026-10-01" },
  { id: "n8n", name: "n8n", category: "Automation", owner: "AI", monthlyCost: 120, status: "healthy" },
];

export const integrations: IntegrationRecord[] = [
  { id: "ghl-meta", name: "GHL → Meta lead sync", platform: "Go High Level", status: "connected", lastSync: "2026-06-11T14:22:00Z", owner: "Marketing" },
  { id: "ghl-twilio", name: "GHL → Twilio SMS", platform: "Twilio", status: "error", lastSync: "2026-06-11T09:10:00Z", owner: "Operations" },
  { id: "hub-openai", name: "Hub → OpenAI agents", platform: "OpenAI", status: "connected", lastSync: "2026-06-11T14:45:00Z", owner: "AI" },
  { id: "n8n-ghl", name: "n8n → GHL workflows", platform: "n8n", status: "connected", lastSync: "2026-06-11T14:30:00Z", owner: "AI" },
  { id: "ringcentral-crm", name: "RingCentral → CRM logging", platform: "RingCentral", status: "connected", lastSync: "2026-06-11T13:55:00Z", owner: "Sales" },
];

export const domains: DomainRecord[] = [
  { id: "primary", domain: "kapitalfunding.com", registrar: "Cloudflare", expiresAt: "2027-03-14", autoRenew: true },
  { id: "app", domain: "app.kapitalfunding.com", registrar: "Cloudflare", expiresAt: "2027-03-14", autoRenew: true },
  { id: "landing", domain: "fund.kapitalfunding.com", registrar: "Cloudflare", expiresAt: "2026-12-01", autoRenew: true },
];

export const servers: ServerRecord[] = [
  { id: "hub-prod", name: "Hub Production", provider: "Hostinger VPS", region: "US-East", status: "online", monthlyCost: 49 },
  { id: "n8n-prod", name: "n8n Worker", provider: "Hostinger VPS", region: "US-East", status: "online", monthlyCost: 29 },
  { id: "staging", name: "Hub Staging", provider: "Hostinger VPS", region: "US-East", status: "degraded", monthlyCost: 19 },
];

export const apiKeys: ApiKeyRecord[] = [
  { id: "openai-prod", service: "OpenAI", owner: "AI", lastRotated: "2026-04-01", scope: "Agents, Copy Lab" },
  { id: "anthropic-prod", service: "Anthropic", owner: "AI", lastRotated: "2026-04-01", scope: "Executive insights" },
  { id: "twilio-prod", service: "Twilio", owner: "Operations", lastRotated: "2026-01-15", expiresAt: "2026-07-15", scope: "SMS, voice webhooks" },
  { id: "meta-ads", service: "Meta Marketing API", owner: "Marketing", lastRotated: "2026-02-20", scope: "Campaign sync" },
  { id: "cloudflare-dns", service: "Cloudflare", owner: "Infrastructure", lastRotated: "2025-11-10", scope: "DNS management" },
];

export const riskItems: RiskItem[] = [
  {
    id: "apps-overdue",
    title: "Applications overdue",
    description: "6 lender submissions have exceeded the 5-day follow-up SLA.",
    category: "sales",
    severity: "high",
    detectedAt: "2026-06-11T08:00:00Z",
    owner: "Sales Ops",
  },
  {
    id: "offers-expiring",
    title: "Offers expiring soon",
    description: "5 funding offers expire within 7 days without client decision.",
    category: "sales",
    severity: "medium",
    detectedAt: "2026-06-11T08:00:00Z",
    owner: "Pipeline team",
  },
  {
    id: "revenue-below-forecast",
    title: "Revenue below forecast",
    description: "MTD revenue is tracking 8% below base-case forecast for June.",
    category: "finance",
    severity: "high",
    detectedAt: "2026-06-10T17:00:00Z",
    owner: "Finance",
  },
  {
    id: "campaign-degradation",
    title: "Campaign performance degradation",
    description: "Meta lead-gen CPL increased 22% week-over-week on top 3 campaigns.",
    category: "marketing",
    severity: "medium",
    detectedAt: "2026-06-10T12:00:00Z",
    owner: "Marketing",
  },
  {
    id: "twilio-disconnected",
    title: "Disconnected integration",
    description: "GHL → Twilio SMS sync failing with authentication errors.",
    category: "infrastructure",
    severity: "critical",
    detectedAt: "2026-06-11T09:10:00Z",
    owner: "Operations",
  },
  {
    id: "staging-degraded",
    title: "Platform degradation",
    description: "Hub staging environment reporting elevated response times.",
    category: "infrastructure",
    severity: "low",
    detectedAt: "2026-06-09T15:30:00Z",
    owner: "Infrastructure",
  },
  {
    id: "roadmap-delays",
    title: "Roadmap delays",
    description: "2 P0 roadmap items slipped past target release date.",
    category: "operations",
    severity: "medium",
    detectedAt: "2026-06-08T10:00:00Z",
    owner: "Product",
  },
];
