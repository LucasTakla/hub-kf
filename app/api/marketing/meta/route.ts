import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { disconnectMetaConnection, saveMetaConnectionConfig } from "@/lib/meta/connection";
import { getMetaCampaignMetrics } from "@/lib/marketing/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    accessToken?: string;
    adAccountId?: string;
  };

  if (!body.accessToken?.trim() || !body.adAccountId?.trim()) {
    return NextResponse.json(
      { error: "accessToken and adAccountId are required" },
      { status: 400 },
    );
  }

  try {
    await saveMetaConnectionConfig({
      accessToken: body.accessToken.trim(),
      adAccountId: body.adAccountId.trim(),
      connectedBy: userId,
    });

    const test = await getMetaCampaignMetrics("7d");
    if (test.error) {
      return NextResponse.json({ error: test.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, campaigns: test.campaigns.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect Meta" },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectMetaConnection();
  return NextResponse.json({ ok: true });
}
