import type {
  RoadmapConfidence,
  RoadmapPriority,
  RoadmapStage,
  RoadmapStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

type PatchBody = {
  title?: string;
  description?: string | null;
  lane?: string;
  priority?: RoadmapPriority;
  status?: RoadmapStatus;
  stage?: RoadmapStage;
  confidence?: RoadmapConfidence;
  progress?: number;
  owner?: string | null;
  team?: string | null;
  startDate?: string | null;
  targetDate?: string;
  completedAt?: string | null;
  dependsOnIds?: string | null;
  dependencies?: string | null;
  sortOrder?: number;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as PatchBody;

  const existing = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.lane !== undefined) data.lane = body.lane;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.status !== undefined) data.status = body.status;
  if (body.stage !== undefined) data.stage = body.stage;
  if (body.confidence !== undefined) data.confidence = body.confidence;
  if (body.progress !== undefined) data.progress = Math.min(100, Math.max(0, body.progress));
  if (body.owner !== undefined) data.owner = body.owner;
  if (body.team !== undefined) data.team = body.team;
  if (body.startDate !== undefined) {
    data.startDate = body.startDate ? new Date(body.startDate) : null;
  }
  if (body.targetDate !== undefined) data.targetDate = new Date(body.targetDate);
  if (body.completedAt !== undefined) {
    data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
  }
  if (body.dependsOnIds !== undefined) data.dependsOnIds = body.dependsOnIds;
  if (body.dependencies !== undefined) data.dependencies = body.dependencies;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  if (body.status === "DONE" && !body.completedAt) {
    data.completedAt = new Date();
    if (body.progress === undefined) data.progress = 100;
  }

  const updated = await prisma.roadmapItem.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.roadmapItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
