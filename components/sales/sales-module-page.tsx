"use client";

import { ApplicationsWorkspace } from "@/components/sales/applications/applications-workspace";
import { LendersWorkspace } from "@/components/sales/lenders/lenders-workspace";
import { OffersWorkspace } from "@/components/sales/offers/offers-workspace";
import { PipelineWorkspace } from "@/components/sales/pipeline/pipeline-workspace";
import type { Deal } from "@/lib/sales/types";

type SalesModulePageProps = {
  slug: string;
  initialDeals: Deal[];
  initialTotal: number;
};

export function SalesModulePage({ slug, initialDeals, initialTotal }: SalesModulePageProps) {
  if (slug === "pipeline") {
    return <PipelineWorkspace initialDeals={initialDeals} initialTotal={initialTotal} />;
  }
  if (slug === "applications") {
    return <ApplicationsWorkspace initialDeals={initialDeals} />;
  }
  if (slug === "offers") {
    return <OffersWorkspace initialDeals={initialDeals} />;
  }
  if (slug === "lenders") {
    return <LendersWorkspace />;
  }
  return null;
}
