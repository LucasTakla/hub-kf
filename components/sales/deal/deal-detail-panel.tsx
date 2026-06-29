"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";

import { formatCurrency } from "@/components/marketing/shared/panel-section";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import {
  ApplicationStatusBadge,
  DocumentStatusBadge,
  OfferStatusBadge,
  OwnerAvatar,
  PriorityBadge,
  StageBadge,
  TaskStatusBadge,
} from "@/components/sales/shared/badges";
import { OfferComparison } from "@/components/sales/offers/offer-comparison";
import { aiLenderRecommendation } from "@/lib/sales/mock-data";
import type { Deal, DealDetailTab } from "@/lib/sales/types";

type DealDetailPanelProps = {
  deal: Deal | null;
  onClose: () => void;
  onRefresh?: () => Promise<void> | void;
};

const detailTabs: { id: DealDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "applications", label: "Applications" },
  { id: "offers", label: "Offers" },
  { id: "documents", label: "Documents" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

export function DealDetailPanel({ deal, onClose }: DealDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DealDetailTab>("overview");

  if (!deal) return null;

  const offerRecords =
    deal.offers.length > 0
      ? deal.offers.map((offer) => ({
          ...offer,
          dealId: deal.id,
          businessName: deal.businessName,
          dealOwner: deal.owner,
          fundingAmount: deal.fundingAmount,
          daysUntilExpiry: Math.ceil(
            (new Date(offer.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          ),
        }))
      : [];

  return (
    <aside
      className="flex h-full w-[min(520px,45vw)] shrink-0 flex-col border-l"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {deal.businessName}
          </h2>
          <p className="mt-0.5 text-[13px] font-medium tabular-nums" style={{ color: "var(--accent)" }}>
            {formatCurrency(deal.fundingAmount)} requested
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StageBadge stage={deal.stage} />
            <PriorityBadge priority={deal.priority} />
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
              <OwnerAvatar name={deal.owner} />
              {deal.owner}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ background: "var(--bg-muted)" }}
          aria-label="Close deal panel"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>

      <ModuleTabs tabs={detailTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto enterprise-scroll p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry" value={deal.industry} />
              <Field label="Annual Revenue" value={formatCurrency(deal.annualRevenue)} />
              <Field label="Contact" value={deal.contactName} />
              <Field label="Email" value={deal.contactEmail} />
              <Field label="Phone" value={deal.contactPhone} />
              <Field label="Source" value={deal.source} />
              <Field label="Days in Stage" value={`${deal.daysInStage} days`} />
              <Field label="Last Activity" value={deal.lastActivity} />
            </div>

            {deal.internalNotes ? (
              <div
                className="rounded-md border p-3"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Internal Notes
                </p>
                <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {deal.internalNotes}
                </p>
              </div>
            ) : null}

            <div
              className="rounded-md border p-3"
              style={{ borderColor: "var(--accent)", background: "var(--accent-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <p className="text-[12px] font-semibold" style={{ color: "var(--accent)" }}>
                  AI Lender Recommendation
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {aiLenderRecommendation}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Applications", value: deal.applications.length },
                { label: "Offers", value: deal.offers.length },
                { label: "Documents", value: deal.documents.filter((d) => d.status === "verified").length + "/" + deal.documents.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-md p-2" style={{ background: "var(--bg-muted)" }}>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{stat.label}</p>
                  <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-2">
            {deal.applications.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No applications yet
              </p>
            ) : (
              deal.applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-md border p-3"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {app.lender}
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {app.submissionDate ? `Submitted ${app.submissionDate}` : "Not yet submitted"}
                        {" · "}{app.assignedUser}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  {app.notes ? (
                    <p className="mt-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>{app.notes}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div className="space-y-4">
            {deal.offers.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No offers received yet
              </p>
            ) : offerRecords.length >= 2 ? (
              <OfferComparison businessName={deal.businessName} offers={offerRecords} compact />
            ) : (
              <div className="rounded-md border p-3" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {deal.offers[0].lender}
                </p>
                <p className="mt-1 text-[11px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {formatCurrency(deal.offers[0].amount)} · Factor {deal.offers[0].factorRate.toFixed(2)}
                </p>
                <div className="mt-2">
                  <OfferStatusBadge status={deal.offers[0].status} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2">
            <button
              type="button"
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-2.5 text-[12px] font-medium"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </button>
            {deal.documents.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No documents yet
              </p>
            ) : (
              deal.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2.5"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {doc.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {doc.type}
                        {doc.uploadedAt ? ` · ${doc.uploadedAt}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentStatusBadge status={doc.status} />
                    {doc.uploadedAt ? (
                      <>
                        <button type="button" aria-label="Preview" className="p-1">
                          <Eye className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                        </button>
                        <button type="button" aria-label="Download" className="p-1">
                          <Download className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-2">
            {deal.tasks.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No tasks assigned
              </p>
            ) : (
              deal.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-start gap-2">
                    {task.status === "done" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4" style={{ color: "var(--success)" }} />
                    ) : (
                      <div className="mt-1 h-3.5 w-3.5 rounded border" style={{ borderColor: "var(--border-default)" }} />
                    )}
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {task.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        <OwnerAvatar name={task.owner} />
                        {task.owner}
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        Due {task.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <TaskStatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <div
              className="rounded-md border p-3"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            >
              <textarea
                rows={3}
                placeholder="Add an internal note... Use @ to mention teammates"
                className="w-full resize-none bg-transparent text-[12px] outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-[11px] font-medium text-white"
                  style={{ background: "var(--accent)" }}
                >
                  Add Note
                </button>
              </div>
            </div>
            {deal.notes.length === 0 ? (
              <p className="text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No notes yet
              </p>
            ) : (
              deal.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md border p-3"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {note.author}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-0">
            {deal.activities.length === 0 ? (
              <p className="py-8 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                No activity yet
              </p>
            ) : (
              deal.activities.map((activity, i) => (
                <div key={activity.id} className="relative flex gap-3 pb-4">
                  {i < deal.activities.length - 1 ? (
                    <div
                      className="absolute left-[5px] top-3 h-full w-px"
                      style={{ background: "var(--border-default)" }}
                    />
                  ) : null}
                  <div
                    className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  <div>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {activity.user} · {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
