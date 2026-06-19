import type {
  ApplicationStatus,
  DealPriority,
  DocumentStatus,
  OfferStatus,
  TaskStatus,
} from "@/lib/sales/types";
import type { LeadNationality, LeadStatus } from "@prisma/client";
import { LEAD_STATUS_LABELS } from "@/lib/leads/constants";
import { LEAD_NATIONALITY_LABELS } from "@/lib/leads/nationality";
import { STAGE_LABELS } from "@/lib/sales/constants";
import type { DealStage } from "@/lib/sales/types";

export function PriorityBadge({ priority }: { priority: DealPriority }) {
  const styles = {
    high: { bg: "var(--danger-subtle)", color: "var(--danger)", label: "High" },
    medium: { bg: "var(--warning-subtle)", color: "var(--warning)", label: "Medium" },
    low: { bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "Low" },
  }[priority];

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: styles.bg, color: styles.color }}
    >
      {styles.label}
    </span>
  );
}

export function StageBadge({ stage }: { stage: DealStage }) {
  const lost = stage === "lost";
  const funded = stage === "funded";
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{
        background: funded ? "var(--success-subtle)" : lost ? "var(--bg-muted)" : "var(--accent-subtle)",
        color: funded ? "var(--success)" : lost ? "var(--text-tertiary)" : "var(--accent)",
      }}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, { bg: string; color: string; label: string }> = {
    draft: { bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "Draft" },
    submitted: { bg: "var(--accent-subtle)", color: "var(--accent)", label: "Submitted" },
    "under-review": { bg: "var(--warning-subtle)", color: "var(--warning)", label: "Under Review" },
    approved: { bg: "var(--success-subtle)", color: "var(--success)", label: "Approved" },
    declined: { bg: "var(--danger-subtle)", color: "var(--danger)", label: "Declined" },
  };
  const s = styles[status];
  return (
    <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const styles: Record<OfferStatus, { bg: string; color: string; label: string }> = {
    received: { bg: "var(--accent-subtle)", color: "var(--accent)", label: "Received" },
    presented: { bg: "var(--warning-subtle)", color: "var(--warning)", label: "Presented" },
    accepted: { bg: "var(--success-subtle)", color: "var(--success)", label: "Accepted" },
    declined: { bg: "var(--danger-subtle)", color: "var(--danger)", label: "Declined" },
    expired: { bg: "var(--bg-muted)", color: "var(--text-tertiary)", label: "Expired" },
  };
  const s = styles[status];
  return (
    <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const styles: Record<DocumentStatus, { bg: string; color: string; label: string }> = {
    missing: { bg: "var(--danger-subtle)", color: "var(--danger)", label: "Missing" },
    requested: { bg: "var(--warning-subtle)", color: "var(--warning)", label: "Requested" },
    received: { bg: "var(--accent-subtle)", color: "var(--accent)", label: "Received" },
    verified: { bg: "var(--success-subtle)", color: "var(--success)", label: "Verified" },
  };
  const s = styles[status];
  return (
    <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, { bg: string; color: string; label: string }> = {
    open: { bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "Open" },
    "in-progress": { bg: "var(--accent-subtle)", color: "var(--accent)", label: "In Progress" },
    done: { bg: "var(--success-subtle)", color: "var(--success)", label: "Done" },
  };
  const s = styles[status];
  return (
    <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const styles: Record<LeadStatus, { bg: string; color: string }> = {
    NEW: { bg: "var(--accent-subtle)", color: "var(--accent)" },
    CONTACTED: { bg: "var(--warning-subtle)", color: "var(--warning)" },
    QUALIFIED: { bg: "var(--success-subtle)", color: "var(--success)" },
    UNQUALIFIED: { bg: "var(--bg-muted)", color: "var(--text-secondary)" },
    CONVERTED: { bg: "var(--success-subtle)", color: "var(--success)" },
    DUPLICATE: { bg: "var(--danger-subtle)", color: "var(--danger)" },
  };
  const style = styles[status];

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export function LeadNationalityBadge({ nationality }: { nationality: LeadNationality }) {
  const styles: Record<LeadNationality, { bg: string; color: string }> = {
    PT: { bg: "var(--accent-subtle)", color: "var(--accent)" },
    ES: { bg: "var(--warning-subtle)", color: "var(--warning)" },
    EN: { bg: "var(--success-subtle)", color: "var(--success)" },
  };
  const style = styles[nationality];

  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
      style={{ background: style.bg, color: style.color }}
      title={LEAD_NATIONALITY_LABELS[nationality]}
    >
      {nationality}
    </span>
  );
}

export function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
      style={{ background: "var(--accent)" }}
      title={name}
    >
      {initials}
    </div>
  );
}
