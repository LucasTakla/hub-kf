import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const maxSort = await prisma.roadmapItem.aggregate({
    where: { lane: existing.lane },
    _max: { sortOrder: true },
  });

  const duplicated = await prisma.roadmapItem.create({
    data: {
      title: `${existing.title} (copy)`,
      description: existing.description,
      module: existing.module,
      phase: existing.phase,
      lane: existing.lane,
      priority: existing.priority,
      status: "PLANNED",
      stage: existing.stage,
      confidence: existing.confidence,
      progress: 0,
      owner: existing.owner,
      team: existing.team,
      startDate: existing.startDate,
      targetDate: existing.targetDate,
      dependsOnIds: existing.dependsOnIds,
      dependencies: existing.dependencies,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(duplicated, { status: 201 });
}
