import { notFound } from "next/navigation";

import { LeadsWorkspace } from "@/components/sales/leads/leads-workspace";
import { SalesModulePage } from "@/components/sales/sales-module-page";
import { getLeadSources, getLeadStats, listLeads } from "@/lib/leads/server";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function SalesPage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/sales/${slug}`];
  if (!config) notFound();

  if (slug === "leads") {
    const [{ items, total }, stats, sources] = await Promise.all([
      listLeads({ limit: 200 }),
      getLeadStats(),
      getLeadSources(),
    ]);

    return (
      <LeadsWorkspace
        initialLeads={items}
        initialTotal={total}
        initialStats={stats}
        initialSources={sources}
      />
    );
  }

  return <SalesModulePage slug={slug} />;
}
