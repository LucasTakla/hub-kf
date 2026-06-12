import type {
  RoadmapConfidence,
  RoadmapPriority,
  RoadmapStage,
  RoadmapStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type PostBody = {
  title: string;
  description?: string | null;
  lane: string;
  priority?: RoadmapPriority;
  status?: RoadmapStatus;
  stage?: RoadmapStage;
  confidence?: RoadmapConfidence;
  progress?: number;
  owner?: string | null;
  team?: string | null;
  startDate?: string | null;
  targetDate: string;
  module?: string;
  phase?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;

  if (!body.title?.trim() || !body.lane || !body.targetDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const release = await prisma.release.findUnique({ where: { slug: body.lane } });
  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  const maxSort = await prisma.roadmapItem.aggregate({
    where: { lane: body.lane },
    _max: { sortOrder: true },
  });

  const created = await prisma.roadmapItem.create({
    data: {
      title: body.title.trim(),
      description: body.description ?? null,
      module: body.module ?? "roadmap",
      phase: body.phase ?? release.label,
      lane: body.lane,
      priority: body.priority ?? "P1",
      status: body.status ?? "PLANNED",
      stage: body.stage ?? "RESEARCH",
      confidence: body.confidence ?? "MEDIUM",
      progress: body.progress ?? 0,
      owner: body.owner ?? null,
      team: body.team ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      targetDate: new Date(body.targetDate),
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
