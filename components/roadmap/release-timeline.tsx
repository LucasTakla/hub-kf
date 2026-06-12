"use client";

import type { Release, RoadmapItem } from "@prisma/client";
import { ChevronDown, ChevronRight, ZoomIn } from "lucide-react";
import { useMemo } from "react";

import { InteractiveTimelineBar } from "@/components/roadmap/interactive-timeline-bar";
import { formatDate } from "@/lib/format";
import { getReleaseStatus } from "@/lib/roadmap-insights";
import { toDate } from "@/lib/roadmap";
import type { ZoomLevel } from "@/lib/roadmap-constants";
import {
  dateToPercent,
  getExtendedTimelineRange,
  getTimelineTicks,
} from "@/lib/timeline-utils";

type ReleaseTimelineProps = {
  releases: Release[];
  items: RoadmapItem[];
  zoom: ZoomLevel;
  expandedRelease: string | null;
  selectedItemId: string | null;
  onToggleRelease: (slug: string) => void;
  onSelectItem: (item: RoadmapItem) => void;
  onItemDatesChange: (itemId: string, startDate: Date, targetDate: Date) => void;
  onReleaseDatesChange: (slug: string, startDate: Date, targetDate: Date) => void;
  onZoomChange: (zoom: ZoomLevel) => void;
};

const statusColors = {
  complete: { bar: "var(--success)", bg: "color-mix(in srgb, var(--success) 15%, transparent)" },
  "on-track": { bar: "var(--accent)", bg: "color-mix(in srgb, var(--accent) 15%, transparent)" },
  "at-risk": { bar: "var(--danger)", bg: "color-mix(in srgb, var(--danger) 15%, transparent)" },
  planned: { bar: "var(--text-tertiary)", bg: "var(--bg-muted)" },
} as const;

const zoomLevels: ZoomLevel[] = ["weeks", "months", "quarters"];

function Milestone({
  pct,
  label,
  color,
}: {
  pct: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="pointer-events-none absolute top-0 flex flex-col items-center"
      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      title={label}
    >
      <div className="h-2 w-2 rounded-full" style={{ background: color }} />
    </div>
  );
}

export function ReleaseTimeline({
  releases,
  items,
  zoom,
  expandedRelease,
  selectedItemId,
  onToggleRelease,
  onSelectItem,
  onItemDatesChange,
  onReleaseDatesChange,
  onZoomChange,
}: ReleaseTimelineProps) {
  const sortedReleases = useMemo(
    () => [...releases].sort((a, b) => a.sortOrder - b.sortOrder),
    [releases],
  );

  const range = useMemo(
    () => getExtendedTimelineRange(sortedReleases, items, zoom),
    [sortedReleases, items, zoom],
  );
  const ticks = useMemo(
    () => getTimelineTicks(range.start, range.end, zoom),
    [range, zoom],
  );
  const todayPct = dateToPercent(new Date(), range.start, range.end);

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ background: "var(--bg-surface)" }}
    >
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Planning timeline
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Drag bars to reschedule · resize edges to change dates
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <ZoomIn className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
          {zoomLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onZoomChange(level)}
              className="rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors"
              style={{
                background: zoom === level ? "var(--accent-subtle)" : "var(--bg-muted)",
                color: zoom === level ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto enterprise-scroll">
        <div
          className="sticky top-0 z-10 flex border-b"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="w-48 shrink-0" />
          <div className="relative h-8 flex-1">
            {ticks.map((tick) => (
              <span
                key={tick.date.toISOString()}
                className="absolute top-2 text-[10px] tabular-nums"
                style={{
                  left: `${dateToPercent(tick.date, range.start, range.end)}%`,
                  transform: "translateX(-50%)",
                  color: "var(--text-tertiary)",
                }}
              >
                {tick.label}
              </span>
            ))}
            {todayPct > 0 && todayPct < 100 ? (
              <div
                className="absolute bottom-0 top-0 w-px"
                style={{ left: `${todayPct}%`, background: "var(--accent)" }}
              />
            ) : null}
          </div>
        </div>

        {sortedReleases.map((release) => {
          const releaseItems = items
            .filter((item) => item.lane === release.slug)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          const status = getReleaseStatus(release, items);
          const colors = statusColors[status];
          const isExpanded = expandedRelease === release.slug;
          const barColor = release.color ?? colors.bar;

          const startPct = dateToPercent(release.startDate, range.start, range.end);
          const targetPct = dateToPercent(release.targetDate, range.start, range.end);
          const completedPct = release.completedAt
            ? dateToPercent(release.completedAt, range.start, range.end)
            : null;

          return (
            <div key={release.slug}>
              <div
                className="flex border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <button
                  type="button"
                  className="flex w-48 shrink-0 items-start gap-1.5 px-3 py-3 text-left"
                  onClick={() => onToggleRelease(release.slug)}
                >
                  {isExpanded ? (
                    <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {release.label}
                    </p>
                    <p className="mt-0.5 text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(release.startDate)} → {formatDate(release.targetDate)}
                    </p>
                    {release.completedAt ? (
                      <p className="text-[10px]" style={{ color: "var(--success)" }}>
                        Done {formatDate(release.completedAt)}
                      </p>
                    ) : null}
                  </div>
                </button>

                <div className="relative flex-1 py-3 pr-4">
                  <InteractiveTimelineBar
                    startDate={release.startDate}
                    endDate={release.targetDate}
                    rangeStart={range.start}
                    rangeEnd={range.end}
                    color={barColor}
                    background={colors.bg}
                    onDatesChange={(start, end) =>
                      onReleaseDatesChange(release.slug, start, end)
                    }
                  />
                  <Milestone pct={startPct} label="Start" color={barColor} />
                  <Milestone pct={targetPct} label="Target" color={barColor} />
                  {completedPct !== null ? (
                    <Milestone pct={completedPct} label="Completed" color="var(--success)" />
                  ) : null}
                  {todayPct > 0 && todayPct < 100 ? (
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 w-px opacity-40"
                      style={{ left: `${todayPct}%`, background: "var(--accent)" }}
                    />
                  ) : null}
                </div>
              </div>

              {isExpanded
                ? releaseItems.map((item) => {
                    const itemStart = item.startDate ?? release.startDate;
                    const isOverdue =
                      item.status !== "DONE" &&
                      toDate(item.targetDate).getTime() < Date.now();
                    const itemColor =
                      item.status === "DONE"
                        ? "var(--success)"
                        : isOverdue
                          ? "var(--danger)"
                          : barColor;

                    return (
                      <div
                        key={item.id}
                        className="flex border-b"
                        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
                      >
                        <div className="flex w-48 shrink-0 items-center pl-8 pr-3 py-2">
                          <button
                            type="button"
                            onClick={() => onSelectItem(item)}
                            className="truncate text-left text-[11px] hover:underline"
                            style={{
                              color:
                                selectedItemId === item.id
                                  ? "var(--accent)"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {item.title}
                          </button>
                        </div>
                        <div className="relative flex-1 py-2 pr-4">
                          <InteractiveTimelineBar
                            startDate={itemStart}
                            endDate={item.targetDate}
                            rangeStart={range.start}
                            rangeEnd={range.end}
                            color={itemColor}
                            background={colors.bg}
                            progress={item.progress}
                            selected={selectedItemId === item.id}
                            onSelect={() => onSelectItem(item)}
                            onDatesChange={(start, end) =>
                              onItemDatesChange(item.id, start, end)
                            }
                          />
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
