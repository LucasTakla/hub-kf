export type MetaDatePreset =
  | "today"
  | "yesterday"
  | "last_7d"
  | "last_30d"
  | "last_90d";

export type MetaConnectionConfig = {
  accessToken: string;
  adAccountId: string;
  tokenExpiresAt?: string | null;
  connectedBy?: string | null;
};

export type MetaActionMetric = {
  action_type: string;
  value: string;
};

export type MetaCampaignInsightRow = {
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaActionMetric[];
  cost_per_action_type?: MetaActionMetric[];
};

export type MetaCampaignRow = {
  id: string;
  name: string;
  effective_status?: string;
  status?: string;
};

export type MetaCampaignMetrics = {
  id: string;
  name: string;
  status: "active" | "paused" | "learning" | "review";
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  metaLeads: number;
  cpl: number;
  hubLeads: number;
  leads: number;
  mqls: number;
  cpmql: number;
  applications: number;
  fundedDeals: number;
  revenue: number;
  roas: number;
  channel: "meta";
};

export type MetaConnectionStatus = {
  connected: boolean;
  adAccountId?: string;
  lastSyncAt?: string | null;
  source: "database" | "environment" | "none";
  oauthAvailable: boolean;
  error?: string;
};

export const META_DATE_PRESET_MAP: Record<string, MetaDatePreset> = {
  today: "today",
  yesterday: "yesterday",
  "7d": "last_7d",
  "30d": "last_30d",
  "90d": "last_90d",
};
