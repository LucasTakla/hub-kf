"use client";

import type { Release, RoadmapActivity, RoadmapItem } from "@prisma/client";

import { RoadmapWorkspace } from "@/components/roadmap/roadmap-workspace";
import { hydrateRelease, hydrateRoadmapItem } from "@/lib/roadmap";

type RoadmapPageClientProps = {
  initialItems: RoadmapItem[];
  initialReleases: Release[];
  initialActivities: RoadmapActivity[];
};

export function RoadmapPageClient({
  initialItems,
  initialReleases,
  initialActivities,
}: RoadmapPageClientProps) {
  return (
    <RoadmapWorkspace
      initialItems={initialItems.map(hydrateRoadmapItem)}
      initialReleases={initialReleases.map(hydrateRelease)}
      initialActivities={initialActivities.map((activity) => ({
        ...activity,
        createdAt: new Date(activity.createdAt),
      }))}
    />
  );
}
