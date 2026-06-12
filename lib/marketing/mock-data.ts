import type {
  AiRecommendation,
  Campaign,
  ChannelMetrics,
  ChatMessage,
  Cohort,
  CopyTemplate,
  Creative,
  CreativeTest,
  FunnelStage,
} from "./types";

export const metaCampaigns: Campaign[] = [
  {
    id: "1",
    name: "MCA — English Broad Q2",
    status: "active",
    spend: 4200,
    leads: 312,
    mqls: 187,
    applications: 78,
    fundedDeals: 24,
    revenue: 54000,
    roas: 12.9,
    channel: "meta",
  },
  {
    id: "2",
    name: "MCA — Spanish Retargeting",
    status: "active",
    spend: 2800,
    leads: 198,
    mqls: 142,
    applications: 52,
    fundedDeals: 19,
    revenue: 42750,
    roas: 15.3,
    channel: "meta",
  },
  {
    id: "3",
    name: "Working Capital — Lookalike 1%",
    status: "learning",
    spend: 1900,
    leads: 156,
    mqls: 89,
    applications: 31,
    fundedDeals: 8,
    revenue: 18000,
    roas: 9.5,
    channel: "meta",
  },
  {
    id: "4",
    name: "SBA — Interest Form Test",
    status: "review",
    spend: 850,
    leads: 64,
    mqls: 28,
    applications: 9,
    fundedDeals: 2,
    revenue: 4500,
    roas: 5.3,
    channel: "meta",
  },
  {
    id: "5",
    name: "Equipment Financing — Video",
    status: "paused",
    spend: 1200,
    leads: 88,
    mqls: 41,
    applications: 14,
    fundedDeals: 3,
    revenue: 6750,
    roas: 5.6,
    channel: "meta",
  },
];

export const campaignRecommendations: AiRecommendation[] = [
  {
    id: "r1",
    type: "action",
    title: "Scale Spanish Retargeting budget +20%",
    description:
      "ROAS is 15.3x with strong funded deal rate (9.6%). CPL is 22% below account average. Increase daily budget from $140 to $168.",
    campaign: "MCA — Spanish Retargeting",
  },
  {
    id: "r2",
    type: "warning",
    title: "Pause SBA Interest Form Test",
    description:
      "Cost per funded deal is $425 vs $175 account average. Lead quality score dropped 18% over 7 days. Recommend pausing and revisiting creative.",
    campaign: "SBA — Interest Form Test",
  },
  {
    id: "r3",
    type: "opportunity",
    title: "Duplicate winning hook to English Broad",
    description:
      "UGC creative #47 (Spanish) has 2.1x ROAS vs campaign average. Test English adaptation in Broad campaign.",
    campaign: "MCA — English Broad Q2",
  },
];

export const creatives: Creative[] = [
  {
    id: "c1",
    name: "UGC — Maria Funding Story",
    type: "ugc",
    status: "active",
    creator: "Alex R.",
    createdAt: "2026-05-28",
    tags: ["UGC", "Spanish", "Testimonial"],
    spend: 3200,
    ctr: 2.8,
    cpl: 14.2,
    costPerApplication: 41,
    costPerFunded: 133,
    revenue: 48000,
    roas: 15.0,
    fatigueScore: 22,
  },
  {
    id: "c2",
    name: "Static — Fast Funding 24hr",
    type: "static",
    status: "active",
    creator: "Jordan M.",
    createdAt: "2026-06-02",
    tags: ["Static", "English", "Speed"],
    spend: 2100,
    ctr: 1.9,
    cpl: 18.5,
    costPerApplication: 52,
    costPerFunded: 175,
    revenue: 24000,
    roas: 11.4,
    fatigueScore: 45,
  },
  {
    id: "c3",
    name: "Video — Owner Testimonial v3",
    type: "video",
    status: "testing",
    creator: "AI Studio",
    createdAt: "2026-06-08",
    tags: ["Video", "English", "Social Proof"],
    spend: 890,
    ctr: 3.1,
    cpl: 12.8,
    costPerApplication: 38,
    costPerFunded: 148,
    revenue: 12000,
    roas: 13.5,
    fatigueScore: 8,
  },
  {
    id: "c4",
    name: "Image — Cash Flow Infographic",
    type: "image",
    status: "active",
    creator: "Sam K.",
    createdAt: "2026-05-15",
    tags: ["Image", "Educational"],
    spend: 1450,
    ctr: 1.4,
    cpl: 22.1,
    costPerApplication: 68,
    costPerFunded: 290,
    revenue: 9000,
    roas: 6.2,
    fatigueScore: 72,
  },
  {
    id: "c5",
    name: "Email — Application Reminder",
    type: "email",
    status: "active",
    creator: "Copy Lab",
    createdAt: "2026-06-01",
    tags: ["Email", "Nurture"],
    spend: 0,
    ctr: 4.2,
    cpl: 0,
    costPerApplication: 0,
    costPerFunded: 0,
    revenue: 8500,
    roas: 0,
    fatigueScore: 15,
  },
];

export const creativeTests: CreativeTest[] = [
  {
    id: "t1",
    name: "Hook A vs Hook B — MCA English",
    status: "winner",
    roas: 14.2,
    spend: 2400,
    fatigueScore: 18,
    startedAt: "2026-05-20",
  },
  {
    id: "t2",
    name: "Static vs UGC — Spanish",
    status: "testing",
    roas: 11.8,
    spend: 1100,
    fatigueScore: 5,
    startedAt: "2026-06-05",
  },
  {
    id: "t3",
    name: "Long-form vs Short Video",
    status: "loser",
    roas: 4.1,
    spend: 980,
    fatigueScore: 85,
    startedAt: "2026-04-28",
  },
];

export const copyTemplates: CopyTemplate[] = [
  {
    id: "cp1",
    name: "Application Follow-Up Sequence",
    channel: "email",
    objective: "Convert submitted leads to funded deals",
    lastUsed: "2026-06-09",
    performance: "32% open rate · 8% reply",
  },
  {
    id: "cp2",
    name: "Same-Day Funding SMS",
    channel: "sms",
    objective: "Re-engage cold leads",
    lastUsed: "2026-06-07",
    performance: "18% click rate",
  },
  {
    id: "cp3",
    name: "Meta Ad — Pain Point Hook",
    channel: "meta-ads",
    objective: "Drive application submissions",
    lastUsed: "2026-06-10",
    performance: "2.4% CTR · $14 CPL",
  },
  {
    id: "cp4",
    name: "Landing Page — MCA Hero",
    channel: "landing-pages",
    objective: "Capture qualified applications",
    lastUsed: "2026-06-04",
    performance: "12% conversion rate",
  },
];

export const analyticsOverview = {
  spend: 48200,
  leads: 1247,
  applications: 312,
  offers: 198,
  fundedDeals: 89,
  revenue: 284500,
};

export const funnelStages: FunnelStage[] = [
  { label: "Spend", value: 48200 },
  { label: "Leads", value: 1247, rate: 100 },
  { label: "MQLs", value: 742, rate: 59.5 },
  { label: "Applications", value: 312, rate: 25.0 },
  { label: "Offers", value: 198, rate: 63.5 },
  { label: "Funded Deals", value: 89, rate: 44.9 },
];

export const channelMetrics: ChannelMetrics[] = [
  { channel: "Meta", spend: 28400, leads: 812, applications: 198, fundedDeals: 56, revenue: 168400, roas: 5.9 },
  { channel: "Google", spend: 12400, leads: 312, applications: 78, fundedDeals: 22, revenue: 66200, roas: 5.3 },
  { channel: "Email", spend: 4200, leads: 89, applications: 24, fundedDeals: 8, revenue: 28400, roas: 6.8 },
  { channel: "SMS", spend: 3200, leads: 34, applications: 12, fundedDeals: 3, revenue: 21500, roas: 6.7 },
];

export const cohorts: Cohort[] = [
  { name: "March 2026", leads: 412, applicationRate: 30, fundedRate: 12, revenue: 80000 },
  { name: "April 2026", leads: 389, applicationRate: 28, fundedRate: 11, revenue: 72000 },
  { name: "May 2026", leads: 446, applicationRate: 32, fundedRate: 14, revenue: 94500 },
];

export const attributionData = [
  { channel: "Meta", revenue: 168400, share: 59.2 },
  { channel: "Google", revenue: 66200, share: 23.3 },
  { channel: "Email", revenue: 28400, share: 10.0 },
  { channel: "SMS", revenue: 21500, share: 7.5 },
];

export const sampleChatMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Why did funded deals decrease last week?",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Funded deals dropped from 24 to 17 (-29%) last week. Primary drivers:\n\n1. **SBA Interest Form Test** — Cost per funded deal increased 42% after creative fatigue (score: 78/100)\n2. **Google Search — Brand** — Budget reduced 15% on Tuesday\n3. **Lead quality** — MQL-to-application rate fell 6pts on English Broad campaign\n\nRecommendation: Pause SBA test, reallocate $200/day to Spanish Retargeting which maintained 9.6% funded rate.",
  },
];

export const aiStudioPrompts = [
  "UGC concept for restaurant owner needing working capital",
  "30-second video script — same-day funding angle",
  "Static ad headline variations for MCA",
  "Hook ideas for Spanish-speaking merchants",
];
