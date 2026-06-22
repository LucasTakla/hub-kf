import type { CampaignStatus } from "@/lib/marketing/types";
import type { CreativeStatus as DbCreativeStatus } from "@prisma/client";
import { CREATIVE_STATUS_LABELS } from "@/lib/creatives/types";

const campaignStyles: Record<CampaignStatus, { bg: string; color: string; label: string }> = {
  active: { bg: "var(--success-subtle)", color: "var(--success)", label: "Active" },
  paused: { bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "Paused" },
  learning: { bg: "var(--accent-subtle)", color: "var(--accent)", label: "Learning" },
  review: { bg: "var(--warning-subtle)", color: "var(--warning)", label: "In Review" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const style = campaignStyles[status];
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

const creativeStyles: Record<DbCreativeStatus, { bg: string; color: string }> = {
  DRAFT: { bg: "var(--bg-muted)", color: "var(--text-secondary)" },
  APPROVED: { bg: "var(--accent-subtle)", color: "var(--accent)" },
  LIVE: { bg: "var(--success-subtle)", color: "var(--success)" },
  TESTING: { bg: "var(--warning-subtle)", color: "var(--warning)" },
  ARCHIVED: { bg: "var(--bg-muted)", color: "var(--text-tertiary)" },
};

export function CreativeStatusBadge({ status }: { status: DbCreativeStatus }) {
  const style = creativeStyles[status];
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {CREATIVE_STATUS_LABELS[status]}
    </span>
  );
}

export function TestStatusBadge({ status }: { status: "winner" | "loser" | "testing" }) {
  const styles = {
    winner: { bg: "var(--success-subtle)", color: "var(--success)", label: "Winner" },
    loser: { bg: "var(--danger-subtle)", color: "var(--danger)", label: "Loser" },
    testing: { bg: "var(--accent-subtle)", color: "var(--accent)", label: "Testing" },
  }[status];

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: styles.bg, color: styles.color }}
    >
      {styles.label}
    </span>
  );
}

export function FatigueBadge({ score }: { score: number }) {
  const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const styles = {
    high: { bg: "var(--danger-subtle)", color: "var(--danger)" },
    medium: { bg: "var(--warning-subtle)", color: "var(--warning)" },
    low: { bg: "var(--success-subtle)", color: "var(--success)" },
  }[level];

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
      style={{ background: styles.bg, color: styles.color }}
    >
      {score}
    </span>
  );
}
