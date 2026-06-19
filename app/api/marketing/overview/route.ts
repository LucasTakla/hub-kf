import { NextResponse } from "next/server";

import { getMarketingOverview } from "@/lib/marketing/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "30d";
  const overview = await getMarketingOverview(range);
  return NextResponse.json(overview);
}
