import type { RoadmapActivity, Release, RoadmapItem } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type RoadmapWorkspaceData = {
  items: RoadmapItem[];
  releases: Release[];
  activities: RoadmapActivity[];
};

export async function getRoadmapWorkspaceData(): Promise<RoadmapWorkspaceData> {
  const [items, releases, activities] = await Promise.all([
    prisma.roadmapItem.findMany({
      orderBy: [{ lane: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.release.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.roadmapActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return { items, releases, activities };
}
