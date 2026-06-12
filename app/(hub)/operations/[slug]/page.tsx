import { notFound } from "next/navigation";

import { OperationsModulePage } from "@/components/operations/operations-module-page";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function OperationsPage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/operations/${slug}`];
  if (!config) notFound();
  return <OperationsModulePage slug={slug} />;
}
