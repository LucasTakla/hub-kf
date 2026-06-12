"use client";

import type { Release, RoadmapActivity, RoadmapItem, RoadmapPriority, RoadmapStatus } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

import { ActivityFeed } from "@/components/roadmap/activity-feed";
import { FeaturePanel } from "@/components/roadmap/feature-panel";
import { ReleaseFormModal } from "@/components/roadmap/release-form-modal";
import { ReleaseLanes } from "@/components/roadmap/release-lanes";
import { ReleaseTimeline } from "@/components/roadmap/release-timeline";
import { ReleasesView } from "@/components/roadmap/releases-view";
import { RoadmapMetricsBar } from "@/components/roadmap/roadmap-metrics";
import { RoadmapToolbar } from "@/components/roadmap/roadmap-toolbar";
import { RoadmapViewTabs } from "@/components/roadmap/roadmap-view-tabs";
import { TaskFormModal } from "@/components/roadmap/task-form-modal";
import {
  reorderReleases,
  reorderRoadmapItems,
  updateRelease,
  updateRoadmapItem,
} from "@/lib/roadmap-api";
import { computeRoadmapMetrics } from "@/lib/roadmap";
import type { RoadmapView, ZoomLevel } from "@/lib/roadmap-constants";

type RoadmapWorkspaceProps = {
  initialItems: RoadmapItem[];
  initialReleases: Release[];
  initialActivities: RoadmapActivity[];
};

export function RoadmapWorkspace({
  initialItems,
  initialReleases,
  initialActivities,
}: RoadmapWorkspaceProps) {
  const [items, setItems] = useState(initialItems);
  const [releases, setReleases] = useState(initialReleases);
  const [activities] = useState(initialActivities);
  const [activeView, setActiveView] = useState<RoadmapView>("board");
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [expandedRelease, setExpandedRelease] = useState<string | null>(
    initialReleases[0]?.slug ?? null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoadmapStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<RoadmapPriority | "ALL">("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [zoom, setZoom] = useState<ZoomLevel>("months");
  const [mounted, setMounted] = useState(false);
  const [taskModalLane, setTaskModalLane] = useState<string | null>(null);
  const [releaseModal, setReleaseModal] = useState<Release | null | "new">(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.owner?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;
      const matchesTeam = teamFilter === "ALL" || item.team === teamFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
    });
  }, [items, search, statusFilter, priorityFilter, teamFilter]);

  const filteredReleases = useMemo(() => {
    if (search.trim() === "") return releases;
    const q = search.toLowerCase();
    return releases.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.owner?.toLowerCase().includes(q),
    );
  }, [releases, search]);

  const metrics = useMemo(
    () => computeRoadmapMetrics(items, activities),
    [items, activities],
  );

  const resultCount =
    activeView === "releases" ? filteredReleases.length : filteredItems.length;

  function handleSelect(item: RoadmapItem) {
    setSelectedItem(item);
  }

  function handleUpdate(item: RoadmapItem) {
    setItems((current) => current.map((i) => (i.id === item.id ? item : i)));
    setSelectedItem(item);
  }

  function handleDelete(id: string) {
    setItems((current) => current.filter((i) => i.id !== id));
    setSelectedItem((current) => (current?.id === id ? null : current));
  }

  function handleDuplicate(item: RoadmapItem) {
    setItems((current) => [...current, item]);
    setSelectedItem(item);
  }

  function handleCreated(item: RoadmapItem) {
    setItems((current) => [...current, item]);
    setSelectedItem(item);
  }

  function handleSelectById(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (item) setSelectedItem(item);
  }

  async function handleMoveItem(itemId: string, laneId: string, itemIds?: string[]) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, lane: laneId } : item,
      ),
    );

    try {
      if (itemIds) {
        const reordered = await reorderRoadmapItems(laneId, itemIds);
        setItems((current) => {
          const others = current.filter((i) => i.lane !== laneId);
          return [...others, ...reordered];
        });
      } else {
        const updated = await updateRoadmapItem(itemId, { lane: laneId });
        handleUpdate(updated);
      }
    } catch {
      setItems(initialItems);
    }
  }

  async function handleReorderItems(laneId: string, itemIds: string[]) {
    setItems((current) => {
      const laneItems = current.filter((i) => i.lane === laneId);
      const others = current.filter((i) => i.lane !== laneId);
      const ordered = itemIds
        .map((id) => laneItems.find((i) => i.id === id))
        .filter((i): i is RoadmapItem => Boolean(i));
      return [...others, ...ordered];
    });

    try {
      const reordered = await reorderRoadmapItems(laneId, itemIds);
      setItems((current) => {
        const others = current.filter((i) => i.lane !== laneId);
        return [...others, ...reordered];
      });
    } catch {
      setItems(initialItems);
    }
  }

  async function handleItemDatesChange(
    itemId: string,
    startDate: Date,
    targetDate: Date,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, startDate, targetDate } : item,
      ),
    );

    try {
      const updated = await updateRoadmapItem(itemId, {
        startDate: startDate.toISOString(),
        targetDate: targetDate.toISOString(),
      });
      handleUpdate(updated);
    } catch {
      setItems(initialItems);
    }
  }

  async function handleReleaseDatesChange(
    slug: string,
    startDate: Date,
    targetDate: Date,
  ) {
    setReleases((current) =>
      current.map((release) =>
        release.slug === slug ? { ...release, startDate, targetDate } : release,
      ),
    );

    try {
      const updated = await updateRelease(slug, {
        startDate: startDate.toISOString(),
        targetDate: targetDate.toISOString(),
      });
      setReleases((current) =>
        current.map((r) => (r.slug === slug ? updated : r)),
      );
    } catch {
      setReleases(initialReleases);
    }
  }

  function handleReleaseSaved(release: Release, previousSlug?: string) {
    setReleases((current) => {
      if (previousSlug) {
        return current.map((r) => (r.slug === previousSlug ? release : r));
      }
      return [...current, release];
    });

    if (previousSlug && previousSlug !== release.slug) {
      setItems((current) =>
        current.map((item) =>
          item.lane === previousSlug ? { ...item, lane: release.slug } : item,
        ),
      );
      if (expandedRelease === previousSlug) setExpandedRelease(release.slug);
    }
  }

  function handleReleaseDeleted(slug: string) {
    setReleases((current) => current.filter((r) => r.slug !== slug));
    if (expandedRelease === slug) setExpandedRelease(null);
  }

  async function handleReorderRelease(slug: string, direction: "left" | "right") {
    const sorted = [...releases].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((r) => r.slug === slug);
    if (index === -1) return;
    const swapIndex = direction === "left" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const next = [...sorted];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

    setReleases(next.map((r, i) => ({ ...r, sortOrder: i + 1 })));

    try {
      const reordered = await reorderReleases(next.map((r) => r.slug));
      setReleases(reordered);
    } catch {
      setReleases(initialReleases);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <RoadmapMetricsBar metrics={metrics} />
      <RoadmapViewTabs activeView={activeView} onViewChange={setActiveView} />
      <RoadmapToolbar
        view={activeView}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        teamFilter={teamFilter}
        onTeamFilterChange={setTeamFilter}
        resultCount={resultCount}
        onNewRelease={() => setReleaseModal("new")}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {activeView === "board" && (
          <div className="flex min-h-0 flex-1">
            <div className="min-h-0 flex-1 overflow-hidden">
              {mounted ? (
                <ReleaseLanes
                  releases={releases}
                  items={filteredItems}
                  selectedId={selectedItem?.id ?? null}
                  fillHeight
                  onSelect={handleSelect}
                  onMoveItem={handleMoveItem}
                  onReorderItems={handleReorderItems}
                  onNewTask={setTaskModalLane}
                  onEditRelease={(release) => setReleaseModal(release)}
                  onReorderRelease={handleReorderRelease}
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-[13px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Loading workspace...
                </div>
              )}
            </div>
            <div className="hidden w-[280px] shrink-0 border-l xl:block" style={{ borderColor: "var(--border-default)" }}>
              <ActivityFeed
                items={items}
                activities={activities}
                releases={releases}
                onSelectItem={handleSelectById}
              />
            </div>
          </div>
        )}

        {activeView === "timeline" && (
          <div className="min-h-0 flex-1">
            {mounted ? (
              <ReleaseTimeline
                releases={releases}
                items={filteredItems}
                zoom={zoom}
                expandedRelease={expandedRelease}
                selectedItemId={selectedItem?.id ?? null}
                onToggleRelease={(slug) =>
                  setExpandedRelease((current) => (current === slug ? null : slug))
                }
                onSelectItem={handleSelect}
                onItemDatesChange={handleItemDatesChange}
                onReleaseDatesChange={handleReleaseDatesChange}
                onZoomChange={setZoom}
              />
            ) : (
              <div
                className="flex h-full items-center justify-center text-[13px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Loading timeline...
              </div>
            )}
          </div>
        )}

        {activeView === "releases" && (
          <ReleasesView
            releases={filteredReleases}
            items={items}
            onEditRelease={(release) => setReleaseModal(release)}
            onSelectItem={handleSelectById}
          />
        )}
      </div>

      <FeaturePanel
        item={selectedItem}
        allItems={items}
        releases={releases}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      <TaskFormModal
        open={taskModalLane !== null}
        defaultLane={taskModalLane ?? releases[0]?.slug ?? "v1"}
        releases={releases}
        onClose={() => setTaskModalLane(null)}
        onCreated={handleCreated}
      />

      <ReleaseFormModal
        open={releaseModal !== null}
        release={releaseModal === "new" ? null : releaseModal}
        onClose={() => setReleaseModal(null)}
        onSaved={handleReleaseSaved}
        onDeleted={handleReleaseDeleted}
      />
    </div>
  );
}
