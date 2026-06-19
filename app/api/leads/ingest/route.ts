import { NextResponse } from "next/server";

import { normalizeLeadIngestPayload } from "@/lib/leads/normalize-ingest";
import { ingestLead } from "@/lib/leads/server";

function getIngestSecret(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey;

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return null;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.LEADS_INGEST_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "LEADS_INGEST_SECRET is not configured on the server" },
      { status: 503 },
    );
  }

  const providedSecret = getIngestSecret(request);
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payloads = normalizeLeadIngestPayload(body);
  if (payloads.length === 0) {
    return NextResponse.json(
      { error: "No valid lead records found in payload" },
      { status: 400 },
    );
  }

  const results = [];
  for (const payload of payloads) {
    const lead = await ingestLead(payload);
    results.push({
      id: lead.id,
      status: lead.status,
      email: lead.email,
      phone: lead.phone,
      fullName: lead.fullName,
      createdAt: lead.createdAt,
    });
  }

  return NextResponse.json({
    ok: true,
    count: results.length,
    leads: results,
  });
}
