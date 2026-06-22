import { notFound } from "next/navigation";

import { CreativesWorkspace } from "@/components/marketing/creatives/creatives-workspace";
import { MarketingModulePage } from "@/components/marketing/marketing-module-page";
import { listCreatives } from "@/lib/creatives/server";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function MarketingPage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/marketing/${slug}`];
  if (!config) notFound();

  if (slug === "creatives") {
    const { items, total } = await listCreatives({ limit: 100 });
    return <CreativesWorkspace initialCreatives={items} initialTotal={total} />;
  }

  return <MarketingModulePage slug={slug} />;
}
