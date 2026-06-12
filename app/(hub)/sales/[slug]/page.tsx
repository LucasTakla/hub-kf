import { notFound } from "next/navigation";

import { SalesModulePage } from "@/components/sales/sales-module-page";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function SalesPage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/sales/${slug}`];
  if (!config) notFound();
  return <SalesModulePage slug={slug} />;
}
