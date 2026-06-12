"use client";

import { ApplicationsWorkspace } from "@/components/sales/applications/applications-workspace";
import { LendersWorkspace } from "@/components/sales/lenders/lenders-workspace";
import { OffersWorkspace } from "@/components/sales/offers/offers-workspace";
import { PipelineWorkspace } from "@/components/sales/pipeline/pipeline-workspace";

const workspaces: Record<string, React.ComponentType> = {
  pipeline: PipelineWorkspace,
  applications: ApplicationsWorkspace,
  offers: OffersWorkspace,
  lenders: LendersWorkspace,
};

type SalesModulePageProps = {
  slug: string;
};

export function SalesModulePage({ slug }: SalesModulePageProps) {
  const Workspace = workspaces[slug];
  if (!Workspace) return null;
  return <Workspace />;
}
