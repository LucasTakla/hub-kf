import { notFound } from "next/navigation";

import { ExecutiveModulePageClient } from "@/components/executive/executive-module-page";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ExecutiveModulePage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/executive/${slug}`];
  if (!config) notFound();
  return <ExecutiveModulePageClient slug={slug} />;
}
