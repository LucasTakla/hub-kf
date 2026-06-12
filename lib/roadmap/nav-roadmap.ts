import {
  executiveNavGroup,
  navGroups,
  type NavGroup,
  type NavItem,
} from "@/lib/navigation";

/** First release due date — Friday 19 Jun 2026 */
export const NAV_ROADMAP_V1_DUE = new Date("2026-06-19T12:00:00.000Z");

const RELEASE_COLORS: Record<string, string> = {
  marketing: "#db2777",
  sales: "#0c5ded",
  operations: "#7c3aed",
  ai: "#059669",
  executive: "#0891b2",
};

const ROADMAP_RELEASE_GROUPS: NavGroup[] = [...navGroups, executiveNavGroup];

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function fridayDueDates(firstDue: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => addDays(firstDue, index * 7));
}

export type NavRoadmapReleaseSeed = {
  slug: string;
  label: string;
  subtitle: string;
  color: string;
  startDate: Date;
  targetDate: Date;
  sortOrder: number;
  navGroupId: string;
};

export type NavRoadmapItemSeed = {
  id: string;
  title: string;
  description: string;
  module: string;
  phase: string;
  lane: string;
  href: string;
  targetDate: Date;
  startDate: Date;
  sortOrder: number;
  dependsOnIds?: string;
};

export function buildNavRoadmapSeed(firstDue: Date = NAV_ROADMAP_V1_DUE): {
  releases: NavRoadmapReleaseSeed[];
  items: NavRoadmapItemSeed[];
  laneStartDates: Record<string, Date>;
} {
  const dueDates = fridayDueDates(firstDue, ROADMAP_RELEASE_GROUPS.length);
  const releases: NavRoadmapReleaseSeed[] = [];
  const items: NavRoadmapItemSeed[] = [];
  const laneStartDates: Record<string, Date> = {};

  let globalSortOrder = 1;
  let previousReleaseLastItemId: string | undefined;

  ROADMAP_RELEASE_GROUPS.forEach((group, releaseIndex) => {
    const slug = `v${releaseIndex + 1}`;
    const targetDate = dueDates[releaseIndex]!;
    const startDate =
      releaseIndex === 0 ? new Date("2026-06-01T12:00:00.000Z") : dueDates[releaseIndex - 1]!;

    laneStartDates[slug] = startDate;

    releases.push({
      slug,
      label: `V${releaseIndex + 1} — ${group.label}`,
      subtitle: group.label,
      color: RELEASE_COLORS[group.id] ?? "#0c5ded",
      startDate,
      targetDate,
      sortOrder: releaseIndex + 1,
      navGroupId: group.id,
    });

    let previousItemId: string | undefined =
      releaseIndex > 0 ? previousReleaseLastItemId : undefined;

    group.items.forEach((navItem: NavItem, itemIndex) => {
      const id = `nav-${slug}-${navItem.href.split("/").pop()}`;
      const dependsOnIds = previousItemId;

      items.push({
        id,
        title: navItem.label,
        description: navItem.description ?? `${group.label} module — ${navItem.label}`,
        module: group.id,
        phase: `V${releaseIndex + 1} — ${group.label}`,
        lane: slug,
        href: navItem.href,
        targetDate,
        startDate,
        sortOrder: globalSortOrder++,
        dependsOnIds,
      });

      previousItemId = id;
    });

    previousReleaseLastItemId = previousItemId;
  });

  return { releases, items, laneStartDates };
}

export function getNavRoadmapReleaseGroups(): NavGroup[] {
  return ROADMAP_RELEASE_GROUPS;
}
