"use client";

import { useCallback, useRef, useState } from "react";

import { toDate } from "@/lib/roadmap";
import { dateToPercent, percentToDate } from "@/lib/timeline-utils";

type DragMode = "move" | "resize-start" | "resize-end";

type InteractiveTimelineBarProps = {
  startDate: Date | string;
  endDate: Date | string;
  rangeStart: Date;
  rangeEnd: Date;
  color: string;
  background: string;
  progress?: number;
  selected?: boolean;
  onDatesChange: (start: Date, end: Date) => void;
  onSelect?: () => void;
};

const MIN_WIDTH_PCT = 1.5;

export function InteractiveTimelineBar({
  startDate,
  endDate,
  rangeStart,
  rangeEnd,
  color,
  background,
  progress,
  selected,
  onDatesChange,
  onSelect,
}: InteractiveTimelineBarProps) {
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    origStart: Date;
    origEnd: Date;
    trackWidth: number;
  } | null>(null);
  const previewRef = useRef<{ start: Date; end: Date } | null>(null);

  const [preview, setPreview] = useState<{ start: Date; end: Date } | null>(null);

  const start = preview?.start ?? toDate(startDate);
  const end = preview?.end ?? toDate(endDate);
  const left = dateToPercent(start, rangeStart, rangeEnd);
  const right = dateToPercent(end, rangeStart, rangeEnd);
  const width = Math.max(right - left, MIN_WIDTH_PCT);

  const computePreview = useCallback(
    (deltaPct: number, dragMode: DragMode, oStart: Date, oEnd: Date) => {
      let newStart = oStart;
      let newEnd = oEnd;

      if (dragMode === "move") {
        const shiftMs = (deltaPct / 100) * (rangeEnd.getTime() - rangeStart.getTime());
        newStart = new Date(oStart.getTime() + shiftMs);
        newEnd = new Date(oEnd.getTime() + shiftMs);
      } else if (dragMode === "resize-start") {
        const pct = dateToPercent(oStart, rangeStart, rangeEnd) + deltaPct;
        newStart = percentToDate(
          Math.min(pct, dateToPercent(oEnd, rangeStart, rangeEnd) - MIN_WIDTH_PCT),
          rangeStart,
          rangeEnd,
        );
      } else {
        const pct = dateToPercent(oEnd, rangeStart, rangeEnd) + deltaPct;
        newEnd = percentToDate(
          Math.max(pct, dateToPercent(oStart, rangeStart, rangeEnd) + MIN_WIDTH_PCT),
          rangeStart,
          rangeEnd,
        );
      }

      return { start: newStart, end: newEnd };
    },
    [rangeStart, rangeEnd],
  );

  const handlePointerDown = useCallback(
    (mode: DragMode) => (event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect?.();

      const trackEl = (event.currentTarget as HTMLElement).closest("[data-timeline-track]");
      if (!trackEl) return;

      const origStart = toDate(startDate);
      const origEnd = toDate(endDate);
      const trackWidth = trackEl.getBoundingClientRect().width;

      dragRef.current = { mode, startX: event.clientX, origStart, origEnd, trackWidth };
      previewRef.current = null;

      const onMove = (moveEvent: PointerEvent) => {
        if (!dragRef.current) return;
        const deltaPct =
          ((moveEvent.clientX - dragRef.current.startX) / dragRef.current.trackWidth) * 100;
        const next = computePreview(
          deltaPct,
          dragRef.current.mode,
          dragRef.current.origStart,
          dragRef.current.origEnd,
        );
        previewRef.current = next;
        setPreview(next);
      };

      const onUp = () => {
        if (previewRef.current) {
          onDatesChange(previewRef.current.start, previewRef.current.end);
        }
        dragRef.current = null;
        previewRef.current = null;
        setPreview(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [startDate, endDate, computePreview, onDatesChange, onSelect],
  );

  return (
    <div
      data-timeline-track
      className="absolute top-1/2 h-5 -translate-y-1/2 rounded"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        background,
        outline: selected ? `2px solid ${color}` : undefined,
      }}
    >
      <div
        className="absolute inset-y-0 left-0 z-10 w-2 cursor-ew-resize rounded-l"
        onPointerDown={handlePointerDown("resize-start")}
      />
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown("move")}
      >
        {progress !== undefined ? (
          <span
            className="pointer-events-none block h-full rounded"
            style={{ width: `${progress}%`, background: color, opacity: 0.85 }}
          />
        ) : (
          <span
            className="pointer-events-none block h-full rounded"
            style={{ background: color, opacity: 0.7 }}
          />
        )}
      </div>
      <div
        className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize rounded-r"
        onPointerDown={handlePointerDown("resize-end")}
      />
    </div>
  );
}
