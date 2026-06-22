import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { deleteCreative, updateCreative } from "@/lib/creatives/server";
import {
  parseCreativeStatus,
  parseCreativeType,
  parseNationality,
  parseTagsInput,
} from "@/lib/creatives/server";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const creative = await updateCreative(id, {
    name: typeof body.name === "string" ? body.name : undefined,
    type: parseCreativeType(typeof body.type === "string" ? body.type : undefined),
    status: parseCreativeStatus(typeof body.status === "string" ? body.status : undefined),
    nationality: body.nationality === null
      ? null
      : parseNationality(typeof body.nationality === "string" ? body.nationality : undefined),
    metaAdName: typeof body.metaAdName === "string" ? body.metaAdName : body.metaAdName === null ? null : undefined,
    script: typeof body.script === "string" ? body.script : body.script === null ? null : undefined,
    tags: typeof body.tags === "string" ? parseTagsInput(body.tags) : Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    creator: typeof body.creator === "string" ? body.creator : body.creator === null ? null : undefined,
    notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
  });

  return NextResponse.json(creative);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteCreative(id);
  return NextResponse.json({ ok: true });
}
