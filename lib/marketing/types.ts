export type CampaignStatus = "active" | "paused" | "learning" | "review";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  leads: number;
  mqls: number;
  applications: number;
  fundedDeals: number;
  revenue: number;
  roas: number;
  channel: "meta" | "google" | "email" | "sms";
};

export type CreativeType = "video" | "ugc" | "image" | "static" | "email" | "sms";
export type CreativeStatus = "active" | "draft" | "archived" | "testing";

export type Creative = {
  id: string;
  name: string;
  type: CreativeType;
  status: CreativeStatus;
  creator: string;
  createdAt: string;
  tags: string[];
  spend: number;
  ctr: number;
  cpl: number;
  costPerApplication: number;
  costPerFunded: number;
  revenue: number;
  roas: number;
  fatigueScore?: number;
};

export type CopyChannel = "email" | "sms" | "whatsapp" | "meta-ads" | "landing-pages";
export type CopyTemplate = {
  id: string;
  name: string;
  channel: CopyChannel;
  objective: string;
  lastUsed: string;
  performance?: string;
};

export type DateRange = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

export type FunnelStage = {
  label: string;
  value: number;
  rate?: number;
};

export type ChannelMetrics = {
  channel: string;
  spend: number;
  leads: number;
  applications: number;
  fundedDeals: number;
  revenue: number;
  roas: number;
};

export type Cohort = {
  name: string;
  leads: number;
  applicationRate: number;
  fundedRate: number;
  revenue: number;
};

export type AiRecommendation = {
  id: string;
  type: "action" | "warning" | "opportunity";
  title: string;
  description: string;
  campaign?: string;
};

export type CreativeTest = {
  id: string;
  name: string;
  status: "winner" | "loser" | "testing";
  roas: number;
  spend: number;
  fatigueScore: number;
  startedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
