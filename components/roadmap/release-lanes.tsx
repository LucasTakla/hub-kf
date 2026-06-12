"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Release, RoadmapItem } from "@prisma/client";
import { ChevronLeft, ChevronRight, Plus, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FeatureCard } from "@/components/roadmap/feature-card";

type ReleaseLanesProps = {
  releases: Release[];
  items: RoadmapItem[];
  selectedId: string | null;
  fillHeight?: boolean;
  onSelect: (item: RoadmapItem) => void;
  onMoveItem: (itemId: string, laneId: string, itemIds?: string[]) => void;
  onReorderItems: (laneId: string, itemIds: string[]) => void;
  onNewTask: (laneId: string) => void;
  onEditRelease: (release: Release) => void;
  onReorderRelease: (slug: string, direction: "left" | "right") => void;
};

function SortableFeatureCard({
  item,
  isSelected,
  onSelect,
}: {
  item: RoadmapItem;
  isSelected: boolean;
  onSelect: (item: RoadmapItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <FeatureCard
        item={item}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function ReleaseLaneColumn({
  release,
  laneItems,
  selectedId,
  canMoveLeft,
  canMoveRight,
  onSelect,
  onNewTask,
  onEditRelease,
  onReorderRelease,
  fillHeight = false,
}: {
  release: Release;
  laneItems: RoadmapItem[];
  selectedId: string | null;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  fillHeight?: boolean;
  onSelect: (item: RoadmapItem) => void;
  onNewTask: (laneId: string) => void;
  onEditRelease: (release: Release) => void;
  onReorderRelease: (slug: string, direction: "left" | "right") => void;
}) {
  const { setNodeRef } = useDroppable({ id: release.slug });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[280px] shrink-0 flex-col rounded-lg border ${fillHeight ? "h-full" : ""}`}
      style={{
        background: "var(--bg-muted)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="border-b px-3 py-2.5"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: release.color ?? "var(--accent)" }}
            />
            <div className="min-w-0">
              <h3
                className="truncate text-[12px] font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {release.label}
              </h3>
              <p className="truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {release.subtitle ?? ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              disabled={!canMoveLeft}
              onClick={() => onReorderRelease(release.slug, "left")}
              className="rounded p-0.5 disabled:opacity-30"
              aria-label="Move release left"
            >
              <ChevronLeft className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            </button>
            <button
              type="button"
              disabled={!canMoveRight}
              onClick={() => onReorderRelease(release.slug, "right")}
              className="rounded p-0.5 disabled:opacity-30"
              aria-label="Move release right"
            >
              <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            </button>
            <button
              type="button"
              onClick={() => onEditRelease(release)}
              className="rounded p-0.5"
              aria-label="Edit release"
            >
              <Settings2 className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            </button>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
              style={{ background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
            >
              {laneItems.length}
            </span>
          </div>
        </div>
      </div>

      <SortableContext
        items={laneItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`flex flex-col gap-2 p-2 ${fillHeight ? "min-h-0 flex-1 overflow-y-auto enterprise-scroll" : ""}`}
        >
          {laneItems.length === 0 ? (
            <div
              className="flex items-center justify-center rounded-md border border-dashed p-4 text-center text-[11px]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
            >
              Drop tasks here
            </div>
          ) : (
            laneItems.map((item) => (
              <SortableFeatureCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </SortableContext>

      <div className="border-t p-2" style={{ borderColor: "var(--border-default)" }}>
        <button
          type="button"
          onClick={() => onNewTask(release.slug)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
          style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </button>
      </div>
    </div>
  );
}

export function ReleaseLanes({
  releases,
  items,
  selectedId,
  onSelect,
  onMoveItem,
  onReorderItems,
  onNewTask,
  onEditRelease,
  onReorderRelease,
  fillHeight = false,
}: ReleaseLanesProps) {
  const [activeItem, setActiveItem] = useState<RoadmapItem | null>(null);

  const sortedReleases = useMemo(
    () => [...releases].sort((a, b) => a.sortOrder - b.sortOrder),
    [releases],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const itemsByLane = useMemo(() => {
    return sortedReleases.reduce<Record<string, RoadmapItem[]>>((acc, release) => {
      acc[release.slug] = items
        .filter((item) => item.lane === release.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    }, {});
  }, [items, sortedReleases]);

  function handleDragStart(event: DragStartEvent) {
    const item = items.find((i) => i.id === event.active.id);
    setActiveItem(item ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeItemData = items.find((i) => i.id === activeId);
    if (!activeItemData) return;

    const targetRelease = sortedReleases.find((r) => r.slug === overId);
    if (targetRelease) {
      if (activeItemData.lane !== targetRelease.slug) {
        const laneItems = [...(itemsByLane[targetRelease.slug] ?? []), activeItemData];
        onMoveItem(activeId, targetRelease.slug, laneItems.map((i) => i.id));
      }
      return;
    }

    const overItem = items.find((item) => item.id === overId);
    if (!overItem) return;

    if (overItem.lane === activeItemData.lane) {
      const laneItems = itemsByLane[activeItemData.lane] ?? [];
      const oldIndex = laneItems.findIndex((i) => i.id === activeId);
      const newIndex = laneItems.findIndex((i) => i.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(laneItems, oldIndex, newIndex);
        onReorderItems(activeItemData.lane, reordered.map((i) => i.id));
      }
      return;
    }

    const targetItems = itemsByLane[overItem.lane] ?? [];
    const insertIndex = targetItems.findIndex((i) => i.id === overId);
    const nextItems = [...targetItems];
    nextItems.splice(insertIndex >= 0 ? insertIndex : nextItems.length, 0, activeItemData);
    onMoveItem(activeId, overItem.lane, nextItems.map((i) => i.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`flex gap-3 overflow-x-auto px-4 py-4 enterprise-scroll ${fillHeight ? "h-full min-h-0 items-stretch" : "items-start"}`}
      >
        {sortedReleases.map((release, index) => (
          <ReleaseLaneColumn
            key={release.slug}
            release={release}
            laneItems={itemsByLane[release.slug] ?? []}
            selectedId={selectedId}
            canMoveLeft={index > 0}
            canMoveRight={index < sortedReleases.length - 1}
            fillHeight={fillHeight}
            onSelect={onSelect}
            onNewTask={onNewTask}
            onEditRelease={onEditRelease}
            onReorderRelease={onReorderRelease}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="w-[260px] rotate-1 opacity-90">
            <FeatureCard item={activeItem} isSelected={false} onSelect={() => undefined} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
