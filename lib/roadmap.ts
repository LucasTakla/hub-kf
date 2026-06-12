import type {
  RoadmapActivity,
  Release,
  RoadmapItem,
} from "@prisma/client";

export type RoadmapMetrics = {
  healthScore: number;
  inProgress: number;
  upcomingReleases: number;
  deliveryConfidence: number;
  teamVelocity: number;
  recentActivityCount: number;
  delayedCount: number;
  atRiskCount: number;
};

export function computeRoadmapMetrics(
  items: RoadmapItem[],
  activities: RoadmapActivity[],
): RoadmapMetrics {
  const inProgress = items.filter((i) => i.status === "IN_PROGRESS").length;
  const done = items.filter((i) => i.status === "DONE").length;
  const atRisk = items.filter((i) => i.confidence === "AT_RISK").length;
  const highConf = items.filter((i) => i.confidence === "HIGH").length;
  const delayed = items.filter(
    (i) => i.status !== "DONE" && toDate(i.targetDate).getTime() < Date.now(),
  ).length;

  const confidenceScore =
    items.length === 0
      ? 0
      : Math.round(
          ((highConf * 100 + (items.length - atRisk - highConf) * 65 + atRisk * 30) /
            items.length),
        );

  const progressAvg =
    items.length === 0
      ? 0
      : Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length);

  const healthScore = Math.round(
    progressAvg * 0.4 + confidenceScore * 0.35 + (done / Math.max(items.length, 1)) * 100 * 0.25,
  );

  const lanes = new Set(items.map((i) => i.lane));
  const upcomingReleases = Math.max(lanes.size - 1, 0);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentDone = items.filter(
    (i) =>
      i.status === "DONE" &&
      (i.completedAt ? toDate(i.completedAt).getTime() : toDate(i.updatedAt).getTime()) > thirtyDaysAgo,
  ).length;

  return {
    healthScore: Math.min(100, healthScore),
    inProgress,
    upcomingReleases,
    deliveryConfidence: confidenceScore,
    teamVelocity: recentDone + inProgress,
    recentActivityCount: activities.filter(
      (a) => toDate(a.createdAt).getTime() > thirtyDaysAgo,
    ).length,
    delayedCount: delayed,
    atRiskCount: atRisk,
  };
}

export function getDependencyTitles(
  item: RoadmapItem,
  items: RoadmapItem[],
): string[] {
  if (!item.dependsOnIds) return [];
  const ids = item.dependsOnIds.split(",").map((id) => id.trim());
  return ids
    .map((id) => items.find((i) => i.id === id)?.title)
    .filter((title): title is string => Boolean(title));
}

export function parseDependsOnIds(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((id) => id.trim()).filter(Boolean);
}

export const statusLabels = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  DONE: "Done",
} as const;

export const confidenceLabels = {
  HIGH: "High confidence",
  MEDIUM: "Medium confidence",
  AT_RISK: "At risk",
} as const;

export const stageLabels = {
  RESEARCH: "Research",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  LAUNCH: "Launch",
} as const;

export function stageIndex(stage: keyof typeof stageLabels): number {
  const order = ["RESEARCH", "DEVELOPMENT", "TESTING", "LAUNCH"] as const;
  return order.indexOf(stage);
}

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function hydrateRoadmapItem(item: RoadmapItem): RoadmapItem {
  return {
    ...item,
    startDate: item.startDate ? new Date(item.startDate) : null,
    targetDate: new Date(item.targetDate),
    completedAt: item.completedAt ? new Date(item.completedAt) : null,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export function hydrateRelease(release: Release): Release {
  return {
    ...release,
    startDate: new Date(release.startDate),
    targetDate: new Date(release.targetDate),
    completedAt: release.completedAt ? new Date(release.completedAt) : null,
    createdAt: new Date(release.createdAt),
    updatedAt: new Date(release.updatedAt),
  };
}
