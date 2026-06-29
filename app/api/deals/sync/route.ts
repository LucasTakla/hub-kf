import { NextResponse } from "next/server";

import { authorizeIngestRequest } from "@/lib/deals/api-auth";
import { normalizeDealSyncPayload } from "@/lib/deals/normalize-sync";
import { syncDealFromGhl } from "@/lib/deals/server";

export async function POST(request: Request) {
  const authError = authorizeIngestRequest(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payloads = normalizeDealSyncPayload(body);
  if (payloads.length === 0) {
    return NextResponse.json(
      { error: "No valid deal records found. ghlOpportunityId is required." },
      { status: 400 },
    );
  }

  const results: Array<{
    id?: string;
    businessName?: string;
    stage?: string;
    action?: string;
    ghlOpportunityId: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (const payload of payloads) {
    try {
      const deal = await syncDealFromGhl(payload);
      results.push({
        ok: true,
        id: deal.id,
        businessName: deal.businessName,
        stage: deal.stage,
        action: payload.action ?? "synced",
        ghlOpportunityId: payload.ghlOpportunityId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      results.push({
        ok: false,
        error: message,
        action: payload.action,
        ghlOpportunityId: payload.ghlOpportunityId,
      });
    }
  }

  const failed = results.filter((item) => !item.ok).length;

  return NextResponse.json({
    ok: failed === 0,
    count: results.length,
    synced: results.length - failed,
    failed,
    deals: results,
  });
}
