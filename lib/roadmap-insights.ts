import type {
  ActivityType,
  Release,
  RoadmapActivity,
  RoadmapItem,
} from "@prisma/client";

import { getDependencyTitles, toDate } from "@/lib/roadmap";

export type InsightSection = {
  id: string;
  label: string;
  items: InsightItem[];
};

export type InsightItem = {
  id: string;
  itemId?: string;
  title: string;
  message: string;
  type: ActivityType;
  dueDate?: Date;
  releaseLabel?: string;
};

function isOverdue(item: RoadmapItem): boolean {
  return item.status !== "DONE" && toDate(item.targetDate).getTime() < Date.now();
}

function isBlocked(item: RoadmapItem, allItems: RoadmapItem[]): boolean {
  if (!item.dependsOnIds) return false;
  const depIds = item.dependsOnIds.split(",").map((id) => id.trim());
  return depIds.some((depId) => {
    const dep = allItems.find((i) => i.id === depId);
    return dep && dep.status !== "DONE";
  });
}

function daysUntil(date: Date | string): number {
  return Math.ceil((toDate(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function buildOperationalInsights(
  items: RoadmapItem[],
  activities: RoadmapActivity[],
  releases: Release[],
): InsightSection[] {
  const releaseMap = new Map(releases.map((r) => [r.slug, r.label]));

  const blockers: InsightItem[] = items
    .filter((item) => item.status !== "DONE" && isBlocked(item, items))
    .map((item) => ({
      id: `blocker-${item.id}`,
      itemId: item.id,
      title: item.title,
      message: `Blocked by: ${getDependencyTitles(item, items).join(", ")}`,
      type: "BLOCKER" as ActivityType,
      dueDate: item.targetDate,
      releaseLabel: releaseMap.get(item.lane),
    }));

  const delays: InsightItem[] = items
    .filter(isOverdue)
    .map((item) => ({
      id: `delay-${item.id}`,
      itemId: item.id,
      title: item.title,
      message: `${Math.abs(daysUntil(item.targetDate))} days overdue`,
      type: "DELAY" as ActivityType,
      dueDate: item.targetDate,
      releaseLabel: releaseMap.get(item.lane),
    }));

  const risks: InsightItem[] = items
    .filter((item) => item.confidence === "AT_RISK" && item.status !== "DONE")
    .map((item) => ({
      id: `risk-${item.id}`,
      itemId: item.id,
      title: item.title,
      message: "Marked at risk — needs attention",
      type: "RISK" as ActivityType,
      dueDate: item.targetDate,
      releaseLabel: releaseMap.get(item.lane),
    }));

  const completed: InsightItem[] = items
    .filter((item) => item.status === "DONE")
    .sort(
      (a, b) =>
        (b.completedAt ? toDate(b.completedAt).getTime() : toDate(b.updatedAt).getTime()) -
        (a.completedAt ? toDate(a.completedAt).getTime() : toDate(a.updatedAt).getTime()),
    )
    .slice(0, 5)
    .map((item) => ({
      id: `done-${item.id}`,
      itemId: item.id,
      title: item.title,
      message: "Completed",
      type: "COMPLETED" as ActivityType,
      releaseLabel: releaseMap.get(item.lane),
    }));

  const shipping: InsightItem[] = items
    .filter(
      (item) =>
        item.status !== "DONE" &&
        daysUntil(item.targetDate) >= 0 &&
        daysUntil(item.targetDate) <= 14,
    )
    .sort((a, b) => toDate(a.targetDate).getTime() - toDate(b.targetDate).getTime())
    .slice(0, 6)
    .map((item) => ({
      id: `ship-${item.id}`,
      itemId: item.id,
      title: item.title,
      message:
        daysUntil(item.targetDate) === 0
          ? "Due today"
          : `Shipping in ${daysUntil(item.targetDate)} days`,
      type: "SHIPPING" as ActivityType,
      dueDate: item.targetDate,
      releaseLabel: releaseMap.get(item.lane),
    }));

  const updates: InsightItem[] = activities
    .filter((a) => a.type === "UPDATE")
    .slice(0, 4)
    .map((activity) => ({
      id: activity.id,
      title: activity.message,
      message: "Recent update",
      type: "UPDATE" as ActivityType,
    }));

  return [
    { id: "blockers", label: "Blockers", items: blockers },
    { id: "delays", label: "Delays", items: delays },
    { id: "risks", label: "Risks", items: risks },
    { id: "shipping", label: "Shipping next", items: shipping },
    { id: "completed", label: "Recently completed", items: completed },
    { id: "updates", label: "Updates", items: updates },
  ].filter((section) => section.items.length > 0);
}

export function getReleaseStatus(
  release: Release,
  items: RoadmapItem[],
): "complete" | "at-risk" | "on-track" | "planned" {
  const releaseItems = items.filter((i) => i.lane === release.slug);
  if (releaseItems.length > 0 && releaseItems.every((i) => i.status === "DONE")) {
    return "complete";
  }
  if (release.completedAt) return "complete";
  if (releaseItems.some((i) => i.confidence === "AT_RISK" || isOverdue(i))) {
    return "at-risk";
  }
  if (releaseItems.some((i) => i.status === "IN_PROGRESS")) return "on-track";
  return "planned";
}

export type ReleaseSummary = {
  release: Release;
  status: ReturnType<typeof getReleaseStatus>;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  plannedTasks: number;
  progress: number;
  blockers: number;
  delays: number;
  atRisk: number;
  highConfidence: number;
  daysUntilTarget: number;
};

export function buildReleaseSummaries(
  releases: Release[],
  items: RoadmapItem[],
): ReleaseSummary[] {
  return [...releases]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((release) => {
      const releaseItems = items.filter((i) => i.lane === release.slug);
      const doneTasks = releaseItems.filter((i) => i.status === "DONE").length;
      const inProgressTasks = releaseItems.filter((i) => i.status === "IN_PROGRESS").length;
      const plannedTasks = releaseItems.filter((i) => i.status === "PLANNED").length;
      const totalTasks = releaseItems.length;
      const progress =
        totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

      return {
        release,
        status: getReleaseStatus(release, items),
        totalTasks,
        doneTasks,
        inProgressTasks,
        plannedTasks,
        progress,
        blockers: releaseItems.filter((i) => i.status !== "DONE" && isBlocked(i, items)).length,
        delays: releaseItems.filter(isOverdue).length,
        atRisk: releaseItems.filter((i) => i.confidence === "AT_RISK" && i.status !== "DONE").length,
        highConfidence: releaseItems.filter((i) => i.confidence === "HIGH" && i.status !== "DONE").length,
        daysUntilTarget: daysUntil(release.targetDate),
      };
    });
}
