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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

import { DealCard } from "@/components/sales/pipeline/deal-card";
import { PIPELINE_STAGES } from "@/lib/sales/constants";
import type { Deal, DealStage } from "@/lib/sales/types";

type PipelineBoardProps = {
  deals: Deal[];
  selectedId: string | null;
  onSelect: (deal: Deal) => void;
  onMoveDeal: (dealId: string, stage: DealStage) => void;
};

function SortableDealCard({
  deal,
  isSelected,
  onSelect,
}: {
  deal: Deal;
  isSelected: boolean;
  onSelect: (deal: Deal) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <DealCard
        deal={deal}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function StageColumn({
  stageId,
  label,
  deals,
  selectedId,
  onSelect,
}: {
  stageId: DealStage;
  label: string;
  deals: Deal[];
  selectedId: string | null;
  onSelect: (deal: Deal) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stageId });

  return (
    <div
      ref={setNodeRef}
      className="flex w-[260px] shrink-0 flex-col rounded-lg border"
      style={{
        background: "var(--bg-muted)",
        borderColor: "var(--border-default)",
        maxHeight: "100%",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-between border-b px-3 py-2"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
          style={{ background: "var(--bg-surface)", color: "var(--text-tertiary)" }}
        >
          {deals.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2 enterprise-scroll">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <SortableDealCard
              key={deal.id}
              deal={deal}
              isSelected={selectedId === deal.id}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function PipelineBoard({ deals, selectedId, onSelect, onMoveDeal }: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const dealsByStage = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, [] as Deal[]])) as Record<
      DealStage,
      Deal[]
    >;
    for (const deal of deals) {
      map[deal.stage]?.push(deal);
    }
    return map;
  }, [deals]);

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const overId = String(over.id);
    const targetStage = PIPELINE_STAGES.find((s) => s.id === overId)?.id;
    if (targetStage && targetStage !== deal.stage) {
      onMoveDeal(dealId, targetStage);
      return;
    }

    const overDeal = deals.find((d) => d.id === overId);
    if (overDeal && overDeal.stage !== deal.stage) {
      onMoveDeal(dealId, overDeal.stage);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto overflow-y-hidden pb-2 enterprise-scroll">
        {PIPELINE_STAGES.map(({ id, label }) => (
          <StageColumn
            key={id}
            stageId={id}
            label={label}
            deals={dealsByStage[id]}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal ? (
          <div className="w-[260px] rotate-2 opacity-90">
            <DealCard deal={activeDeal} isSelected={false} onSelect={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
