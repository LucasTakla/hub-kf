import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { syncDealFromGhl } from "@/lib/deals/server";
import type { DealSyncInput } from "@/lib/deals/types";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const records = Array.isArray(body)
    ? body
    : body && typeof body === "object" && Array.isArray((body as { deals?: unknown }).deals)
      ? (body as { deals: DealSyncInput[] }).deals
      : null;

  if (!records?.length) {
    return NextResponse.json({ error: "No deals provided" }, { status: 400 });
  }

  if (records.length > 500) {
    return NextResponse.json(
      { error: "Maximum 500 deals per import batch. Split your CSV into smaller files." },
      { status: 400 },
    );
  }

  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const [index, record] of records.entries()) {
    if (!record?.ghlOpportunityId?.trim()) {
      errors.push(`Row ${index + 1}: missing opportunity id`);
      failed += 1;
      continue;
    }

    try {
      await syncDealFromGhl({
        ...record,
        action: "opportunity-created",
      });
      imported += 1;
    } catch (error) {
      failed += 1;
      errors.push(
        `Row ${index + 1}: ${error instanceof Error ? error.message : "Import failed"}`,
      );
    }
  }

  return NextResponse.json({
    ok: failed === 0,
    total: records.length,
    imported,
    failed,
    errors: errors.slice(0, 10),
  });
}
