"use client";

import { FinancialsWorkspace } from "@/components/executive/financials/financials-workspace";
import { InfrastructureWorkspace } from "@/components/executive/infrastructure/infrastructure-workspace";
import { OverviewWorkspace } from "@/components/executive/overview/overview-workspace";
import { RisksWorkspace } from "@/components/executive/risks/risks-workspace";

const workspaces: Record<string, React.ComponentType> = {
  overview: OverviewWorkspace,
  financials: FinancialsWorkspace,
  infrastructure: InfrastructureWorkspace,
  risks: RisksWorkspace,
};

type ExecutiveModulePageProps = {
  slug: string;
};

export function ExecutiveModulePageClient({ slug }: ExecutiveModulePageProps) {
  const Workspace = workspaces[slug];
  if (!Workspace) return null;
  return <Workspace />;
}
