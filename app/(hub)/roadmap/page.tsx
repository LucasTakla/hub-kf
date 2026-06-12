import { RoadmapPageClient } from "@/components/roadmap/roadmap-page-client";
import { getRoadmapWorkspaceData } from "@/lib/roadmap-server";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const { items, releases, activities } = await getRoadmapWorkspaceData();

  return (
    <RoadmapPageClient
      initialItems={items}
      initialReleases={releases}
      initialActivities={activities}
    />
  );
}
