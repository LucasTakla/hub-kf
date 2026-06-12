"use client";

import { ActivityWorkspace } from "@/components/operations/activity/activity-workspace";
import { SopsWorkspace } from "@/components/operations/sops/sops-workspace";
import { TeamWorkspace } from "@/components/operations/team/team-workspace";

const workspaces: Record<string, React.ComponentType> = {
  activity: ActivityWorkspace,
  team: TeamWorkspace,
  sops: SopsWorkspace,
};

type OperationsModulePageProps = {
  slug: string;
};

export function OperationsModulePage({ slug }: OperationsModulePageProps) {
  const Workspace = workspaces[slug];
  if (!Workspace) return null;
  return <Workspace />;
}
