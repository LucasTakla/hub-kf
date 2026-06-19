import { NextResponse } from "next/server";

import { getMetaCampaignMetrics } from "@/lib/marketing/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "30d";
  const result = await getMetaCampaignMetrics(range);
  return NextResponse.json(result);
}
