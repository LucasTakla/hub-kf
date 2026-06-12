"use client";

import { GripVertical } from "lucide-react";

import { OwnerAvatar, PriorityBadge } from "@/components/sales/shared/badges";
import { formatCurrency } from "@/components/marketing/shared/panel-section";
import type { Deal } from "@/lib/sales/types";

type DealCardProps = {
  deal: Deal;
  isSelected: boolean;
  onSelect: (deal: Deal) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

export function DealCard({ deal, isSelected, onSelect, dragHandleProps }: DealCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(deal)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(deal);
        }
      }}
      className="group cursor-pointer rounded-md border px-3 py-2.5 transition-colors"
      style={{
        background: isSelected ? "var(--accent-subtle)" : "var(--bg-surface)",
        borderColor: isSelected ? "var(--accent)" : "var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-[13px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
          {deal.businessName}
        </h3>
        <button
          type="button"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag deal"
        >
          <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      <p className="mt-1 text-[12px] font-medium tabular-nums" style={{ color: "var(--accent)" }}>
        {formatCurrency(deal.fundingAmount)}
      </p>

      <div className="mt-2 flex flex-wrap gap-1">
        <PriorityBadge priority={deal.priority} />
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
        <span>Apps: <strong className="tabular-nums" style={{ color: "var(--text-primary)" }}>{deal.applications.length}</strong></span>
        <span>Offers: <strong className="tabular-nums" style={{ color: "var(--text-primary)" }}>{deal.offers.length}</strong></span>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex min-w-0 items-center gap-1.5">
          <OwnerAvatar name={deal.owner} />
          <span className="truncate text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {deal.owner}
          </span>
        </div>
        <span className="shrink-0 text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
          {deal.daysInStage}d in stage
        </span>
      </div>

      <p className="mt-1.5 truncate text-[10px]" style={{ color: "var(--text-tertiary)" }}>
        {deal.lastActivity}
      </p>
    </article>
  );
}
