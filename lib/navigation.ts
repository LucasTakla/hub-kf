import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  ClipboardList,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  Map,
  Megaphone,
  Palette,
  PenLine,
  Receipt,
  Server,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const overviewNav: NavItem = {
  label: "Overview",
  href: "/overview",
  icon: Home,
  description: "Company command center",
};

export const navGroups: NavGroup[] = [
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { label: "Campaigns", href: "/marketing/campaigns", icon: Megaphone, description: "Campaign management and performance" },
      { label: "Creatives", href: "/marketing/creatives", icon: Palette, description: "Ad creatives and asset library" },
      { label: "Copy Lab", href: "/marketing/copy-lab", icon: PenLine, description: "Messaging and copy experiments" },
      { label: "Analytics", href: "/marketing/analytics", icon: BarChart3, description: "Channel analytics and attribution" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { label: "Pipeline", href: "/sales/pipeline", icon: Briefcase, description: "Deal-centric funding pipeline" },
      { label: "Leads", href: "/sales/leads", icon: UserPlus, description: "Inbound leads from marketing and n8n intake" },
      { label: "Applications", href: "/sales/applications", icon: FileText, description: "Lender submission tracking across all deals" },
      { label: "Offers", href: "/sales/offers", icon: Receipt, description: "Funding proposals and offer comparison" },
      { label: "Lenders", href: "/sales/lenders", icon: Landmark, description: "Lender partner management and performance" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Activity", href: "/operations/activity", icon: Activity, description: "Company-wide operational activity feed" },
      { label: "Team", href: "/operations/team", icon: Users, description: "Workload, ownership, and team visibility" },
      { label: "SOPs", href: "/operations/sops", icon: ClipboardList, description: "Operating manual and process knowledge" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { label: "Agents", href: "/ai/agents", icon: Bot, description: "AI agents and automations" },
      { label: "Workflows", href: "/ai/workflows", icon: Workflow, description: "Automated workflow orchestration" },
      { label: "Knowledge Base", href: "/ai/knowledge-base", icon: BookOpen, description: "Company knowledge and context" },
      { label: "Prompt Library", href: "/ai/prompt-library", icon: Sparkles, description: "Reusable prompts and templates" },
    ],
  },
];

export const executiveNavGroup: NavGroup = {
  id: "executive",
  label: "Executive",
  items: [
    { label: "Overview", href: "/executive/overview", icon: LayoutDashboard, description: "High-level company performance" },
    { label: "Financials", href: "/executive/financials", icon: Wallet, description: "Revenue, expenses, commissions, and forecasting" },
    { label: "Infrastructure", href: "/executive/infrastructure", icon: Server, description: "Platforms, integrations, and system health" },
    { label: "Risks", href: "/executive/risks", icon: AlertTriangle, description: "Centralized company risk center" },
  ],
};

export function getVisibleNavGroups(canAccessExecutive: boolean): NavGroup[] {
  if (!canAccessExecutive) return navGroups;
  return [...navGroups, executiveNavGroup];
}

export const platformNav: NavItem[] = [
  {
    label: "Roadmap",
    href: "/roadmap",
    icon: Map,
    description: "Cross-functional product planning",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Integrations and configuration",
  },
];

export type ModulePageConfig = {
  title: string;
  description: string;
  phase?: string;
};

export const modulePages: Record<string, ModulePageConfig> = {
  "/marketing/campaigns": {
    title: "Campaigns",
    description: "Day-to-day media buying — monitor spend, optimize campaigns, and connect ads to funded deals.",
    phase: "Execute",
  },
  "/marketing/creatives": {
    title: "Creatives",
    description: "Creative asset library, performance rankings, AI generation, and experiment tracking.",
    phase: "Produce",
  },
  "/marketing/copy-lab": {
    title: "Copy Lab",
    description: "Messaging workspace for email, SMS, WhatsApp, ads, and landing page copy.",
    phase: "Communicate",
  },
  "/marketing/analytics": {
    title: "Analytics",
    description: "Business intelligence — funnel analysis, cohorts, attribution, and AI-powered insights.",
    phase: "Understand",
  },
  "/sales/pipeline": {
    title: "Pipeline",
    description: "Deal-centric Kanban — the daily operating workspace for funding opportunities.",
    phase: "Deal Management",
  },
  "/sales/leads": {
    title: "Leads",
    description: "Live inbound lead inbox — intake from n8n replaces the Google Sheets log.",
    phase: "Lead Intake",
  },
  "/sales/applications": {
    title: "Applications",
    description: "Track all lender submissions — status, follow-ups, and approval rates.",
    phase: "Submission Management",
  },
  "/sales/offers": {
    title: "Offers",
    description: "Track funding proposals — present, compare, and close on the best terms.",
    phase: "Funding Proposal Management",
  },
  "/sales/lenders": {
    title: "Lenders",
    description: "Lender partner profiles, funding criteria, and performance analytics.",
    phase: "Partner Management",
  },
  "/operations/activity": {
    title: "Activity",
    description: "Real-time feed of what is happening across Marketing, Sales, Operations, AI, Executive, and Roadmap.",
    phase: "What is happening?",
  },
  "/operations/team": {
    title: "Team",
    description: "Operational visibility into workload, deal ownership, and activity distribution.",
    phase: "Who is responsible?",
  },
  "/operations/sops": {
    title: "SOPs",
    description: "Searchable operating manual — how to qualify deals, submit applications, launch campaigns, and more.",
    phase: "How do we do it?",
  },
  "/ai/agents": {
    title: "Agents",
    description: "Deploy and monitor AI agents for lead qualification, follow-ups, and ops tasks.",
    phase: "AI",
  },
  "/ai/workflows": {
    title: "Workflows",
    description: "Build automated workflows connecting CRM, email, ads, and internal tools.",
    phase: "AI",
  },
  "/ai/knowledge-base": {
    title: "Knowledge Base",
    description: "Company knowledge, lender docs, and SOPs for AI context.",
    phase: "AI",
  },
  "/ai/prompt-library": {
    title: "Prompt Library",
    description: "Curated prompts for sales, marketing, and executive use cases.",
    phase: "AI",
  },
  "/executive/overview": {
    title: "Overview",
    description: "High-level view of company performance — revenue, pipeline, spend, and forecast.",
    phase: "Executive",
  },
  "/executive/financials": {
    title: "Financials",
    description: "Revenue, expenses, commissions, and forecasting for leadership.",
    phase: "Executive",
  },
  "/executive/infrastructure": {
    title: "Infrastructure",
    description: "Platform costs, ownership, system health, renewals, and dependencies.",
    phase: "Executive",
  },
  "/executive/risks": {
    title: "Risks",
    description: "Centralized company risk center across sales, marketing, finance, and ops.",
    phase: "Executive",
  },
};

export function getPageMeta(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/overview") {
    return { title: "Overview", subtitle: "Company command center" };
  }

  const modulePage = modulePages[pathname];
  if (modulePage) {
    return { title: modulePage.title, subtitle: modulePage.phase };
  }

  const platform = platformNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (platform) {
    return { title: platform.label, subtitle: platform.description };
  }

  return { title: "Hub" };
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/overview") return pathname === "/overview";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const moduleLabels: Record<string, string> = {
  foundation: "Foundation",
  roadmap: "Roadmap",
  marketing: "Marketing",
  sales: "Sales",
  operations: "Operations",
  ai: "AI",
  executive: "Executive",
  leads: "Leads",
  crm: "CRM",
  integrations: "Integrations",
};
