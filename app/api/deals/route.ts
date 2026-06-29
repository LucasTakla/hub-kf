import type { DealStage } from "@prisma/client";
import { NextResponse } from "next/server";

import { getDealStats, listDeals } from "@/lib/deals/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stage = (searchParams.get("stage") ?? "all") as DealStage | "all";
  const owner = searchParams.get("owner") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const includeStats = searchParams.get("stats") === "1";

  const [{ items, total }, stats] = await Promise.all([
    listDeals({ stage, owner, search }),
    includeStats ? getDealStats() : Promise.resolve(null),
  ]);

  return NextResponse.json({ items, total, stats });
}
