import type { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getLeadSources, getLeadStats, listLeads } from "@/lib/leads/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "all") as LeadStatus | "all";
  const source = searchParams.get("source") ?? "all";
  const search = searchParams.get("search") ?? undefined;
  const includeStats = searchParams.get("stats") === "1";

  const [{ items, total }, stats, sources] = await Promise.all([
    listLeads({ status, source, search }),
    includeStats ? getLeadStats() : Promise.resolve(null),
    getLeadSources(),
  ]);

  return NextResponse.json({
    items,
    total,
    stats,
    sources,
  });
}
