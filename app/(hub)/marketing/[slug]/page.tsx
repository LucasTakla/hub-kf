import { notFound } from "next/navigation";

import { MarketingModulePage } from "@/components/marketing/marketing-module-page";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function MarketingPage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/marketing/${slug}`];
  if (!config) notFound();
  return <MarketingModulePage slug={slug} />;
}
