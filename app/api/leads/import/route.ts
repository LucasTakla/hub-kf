import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ingestLead } from "@/lib/leads/server";
import type { LeadIngestInput } from "@/lib/leads/types";

type ImportLeadPayload = LeadIngestInput & {
  status?: LeadIngestInput["status"];
};

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
    : body && typeof body === "object" && Array.isArray((body as { leads?: unknown }).leads)
      ? (body as { leads: ImportLeadPayload[] }).leads
      : null;

  if (!records?.length) {
    return NextResponse.json({ error: "No leads provided" }, { status: 400 });
  }

  if (records.length > 500) {
    return NextResponse.json(
      { error: "Maximum 500 leads per import batch. Split your CSV into smaller files." },
      { status: 400 },
    );
  }

  let imported = 0;
  let duplicates = 0;
  const errors: string[] = [];

  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== "object") {
      errors.push(`Row ${index + 1}: invalid record`);
      continue;
    }

    try {
      const lead = await ingestLead(record as ImportLeadPayload);
      if (lead.status === "DUPLICATE") {
        duplicates += 1;
      } else {
        imported += 1;
      }
    } catch (error) {
      errors.push(
        `Row ${index + 1}: ${error instanceof Error ? error.message : "Import failed"}`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    total: records.length,
    imported,
    duplicates,
    errors: errors.slice(0, 10),
  });
}
