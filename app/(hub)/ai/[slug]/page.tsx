import { notFound } from "next/navigation";

import { PlaceholderPage } from "@/components/hub/placeholder-page";
import { modulePages } from "@/lib/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export default async function AiModulePage({ params }: PageProps) {
  const { slug } = await params;
  const config = modulePages[`/ai/${slug}`];
  if (!config) notFound();
  return <PlaceholderPage {...config} />;
}
