import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type ReorderBody = {
  lane: string;
  itemIds: string[];
};

export async function PATCH(request: Request) {
  const body = (await request.json()) as ReorderBody;

  if (!body.lane || !Array.isArray(body.itemIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.$transaction(
    body.itemIds.map((id, index) =>
      prisma.roadmapItem.update({
        where: { id },
        data: { sortOrder: index + 1, lane: body.lane },
      }),
    ),
  );

  const items = await prisma.roadmapItem.findMany({
    where: { lane: body.lane },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}
