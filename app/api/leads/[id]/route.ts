import type { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { updateLeadStatus } from "@/lib/leads/server";

type PatchBody = {
  status?: LeadStatus;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as PatchBody;

  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const lead = await updateLeadStatus(id, body.status);
  return NextResponse.json(lead);
}
