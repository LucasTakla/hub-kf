"use client";

import { AnalyticsWorkspace } from "@/components/marketing/analytics/analytics-workspace";
import { CampaignsWorkspace } from "@/components/marketing/campaigns/campaigns-workspace";
import { CopyLabWorkspace } from "@/components/marketing/copy-lab/copy-lab-workspace";
import { CreativesWorkspace } from "@/components/marketing/creatives/creatives-workspace";

const workspaces: Record<string, React.ComponentType> = {
  campaigns: CampaignsWorkspace,
  creatives: CreativesWorkspace,
  "copy-lab": CopyLabWorkspace,
  analytics: AnalyticsWorkspace,
};

type MarketingModulePageProps = {
  slug: string;
};

export function MarketingModulePage({ slug }: MarketingModulePageProps) {
  const Workspace = workspaces[slug];
  if (!Workspace) return null;
  return <Workspace />;
}
