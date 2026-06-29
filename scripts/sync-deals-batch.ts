#!/usr/bin/env tsx
/**
 * Bulk import GHL opportunities into the Hub.
 *
 * Usage:
 *   HUB_URL=https://hub.kapitalfunding.co \
 *   DEALS_SYNC_SECRET=your-secret \
 *   npx tsx scripts/sync-deals-batch.ts ./scripts/deals-import.example.json
 *
 * Or against production DB directly (no HTTP):
 *   dotenv -e .env.local -- npx tsx scripts/sync-deals-batch.ts ./file.json --local
 */

import { readFileSync } from "fs";

import { normalizeDealSyncPayload } from "@/lib/deals/normalize-sync";
import { syncDealFromGhl } from "@/lib/deals/server";

async function syncViaApi(filePath: string) {
  const hubUrl = process.env.HUB_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.DEALS_SYNC_SECRET ?? process.env.LEADS_INGEST_SECRET;

  if (!hubUrl) throw new Error("Set HUB_URL or NEXT_PUBLIC_APP_URL");
  if (!secret) throw new Error("Set DEALS_SYNC_SECRET or LEADS_INGEST_SECRET");

  const body = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  const response = await fetch(`${hubUrl.replace(/\/$/, "")}/api/deals/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secret,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as Record<string, unknown>;
  console.log(JSON.stringify(payload, null, 2));
  if (!response.ok) process.exit(1);
}

async function syncLocal(filePath: string) {
  const body = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  const payloads = normalizeDealSyncPayload(body);
  let ok = 0;
  let failed = 0;

  for (const payload of payloads) {
    try {
      const deal = await syncDealFromGhl(payload);
      ok += 1;
      console.log(`✓ ${deal.businessName} → ${deal.stage}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Sync failed";
      console.error(`✗ ${payload.ghlOpportunityId}: ${message}`);
    }
  }

  console.log(`Done. synced=${ok} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

const filePath = process.argv[2];
const mode = process.argv[3];

if (!filePath) {
  console.error("Usage: npx tsx scripts/sync-deals-batch.ts <json-file> [--local]");
  process.exit(1);
}

if (mode === "--local") {
  void syncLocal(filePath);
} else {
  void syncViaApi(filePath);
}
