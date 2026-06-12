import type { Release, RoadmapItem } from "@prisma/client";

import type { ZoomLevel } from "@/lib/roadmap-constants";

export function getTimelineRange(zoom: ZoomLevel, anchor: Date = new Date()) {
  const start = new Date(anchor);
  const end = new Date(anchor);

  if (zoom === "weeks") {
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 49);
  } else if (zoom === "months") {
    start.setMonth(start.getMonth() - 1);
    end.setMonth(end.getMonth() + 5);
  } else {
    start.setMonth(start.getMonth() - 3);
    end.setMonth(end.getMonth() + 9);
  }

  return { start, end };
}

export function dateToPercent(date: Date, rangeStart: Date, rangeEnd: Date): number {
  const total = rangeEnd.getTime() - rangeStart.getTime();
  if (total <= 0) return 0;
  const pct = ((date.getTime() - rangeStart.getTime()) / total) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function percentToDate(pct: number, rangeStart: Date, rangeEnd: Date): Date {
  const total = rangeEnd.getTime() - rangeStart.getTime();
  return new Date(rangeStart.getTime() + (pct / 100) * total);
}

export function getTimelineTicks(rangeStart: Date, rangeEnd: Date, zoom: ZoomLevel) {
  const ticks: { date: Date; label: string }[] = [];
  const cursor = new Date(rangeStart);

  if (zoom === "weeks") {
    while (cursor <= rangeEnd) {
      ticks.push({
        date: new Date(cursor),
        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else if (zoom === "months") {
    cursor.setDate(1);
    while (cursor <= rangeEnd) {
      ticks.push({
        date: new Date(cursor),
        label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    cursor.setDate(1);
    while (cursor <= rangeEnd) {
      ticks.push({
        date: new Date(cursor),
        label: `Q${Math.floor(cursor.getMonth() / 3) + 1} ${cursor.getFullYear()}`,
      });
      cursor.setMonth(cursor.getMonth() + 3);
    }
  }

  return ticks;
}

export function getExtendedTimelineRange(
  releases: Release[],
  items: RoadmapItem[],
  zoom: ZoomLevel,
) {
  const base = getTimelineRange(zoom);
  const dates: Date[] = [base.start, base.end];

  for (const release of releases) {
    dates.push(release.startDate, release.targetDate);
    if (release.completedAt) dates.push(release.completedAt);
  }

  for (const item of items) {
    if (item.startDate) dates.push(item.startDate);
    dates.push(item.targetDate);
    if (item.completedAt) dates.push(item.completedAt);
  }

  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));

  const padding =
    zoom === "weeks" ? 7 : zoom === "months" ? 14 : 30;
  min.setDate(min.getDate() - padding);
  max.setDate(max.getDate() + padding);

  return { start: min, end: max };
}
