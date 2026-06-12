"use client";

import { useState } from "react";
import {
  Building2,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  TrendingUp,
} from "lucide-react";

import { ModuleHeader, PanelSection, formatCurrency, formatNumber } from "@/components/marketing/shared/panel-section";
import { MetricCard } from "@/components/marketing/shared/metric-card";
import { lenders } from "@/lib/sales/mock-data";
import type { Lender } from "@/lib/sales/types";

export function LendersWorkspace() {
  const [selected, setSelected] = useState<Lender | null>(lenders[0]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Partner Management"
        purpose="Lender profiles and performance analytics — where should we submit deals?"
      />

      <div className="flex min-h-0 flex-1">
        <div
          className="w-[320px] shrink-0 overflow-y-auto border-r enterprise-scroll"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="p-3 space-y-1">
            {lenders.map((lender) => (
              <button
                key={lender.id}
                type="button"
                onClick={() => setSelected(lender)}
                className="w-full rounded-md border px-3 py-2.5 text-left transition-colors"
                style={{
                  background: selected?.id === lender.id ? "var(--accent-subtle)" : "var(--bg-surface)",
                  borderColor: selected?.id === lender.id ? "var(--accent)" : "var(--border-default)",
                }}
              >
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {lender.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  <span>{lender.approvalRate}% approval</span>
                  <span>{lender.averageResponseDays}d avg response</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto enterprise-scroll p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {selected.name}
                  </h2>
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[12px] hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    <Globe className="h-3 w-3" />
                    {selected.website.replace("https://", "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Building2 className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Applications Submitted" value={formatNumber(selected.applicationsSubmitted)} />
                <MetricCard label="Approval Rate" value={`${selected.approvalRate}%`} changePositive />
                <MetricCard label="Funding Rate" value={`${selected.fundingRate}%`} />
                <MetricCard label="Avg Response Time" value={`${selected.averageResponseDays}d`} />
                <MetricCard label="Avg Deal Size" value={formatCurrency(selected.averageDealSize)} />
                <MetricCard label="Avg Offer Amount" value={formatCurrency(selected.averageOfferAmount)} highlight />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PanelSection title="Contact Information">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <Building2 className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ color: "var(--text-primary)" }}>{selected.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <Mail className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>{selected.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <Phone className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>{selected.contactPhone}</span>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection title="Funding Criteria">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        Amount Range
                      </p>
                      <p className="mt-0.5 text-[13px] tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(selected.minAmount)} — {formatCurrency(selected.maxAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        Funding Types
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selected.fundingTypes.map((type) => (
                          <span
                            key={type}
                            className="rounded px-1.5 py-0.5 text-[10px]"
                            style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        Industries
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selected.industries.map((ind) => (
                          <span
                            key={ind}
                            className="rounded px-1.5 py-0.5 text-[10px]"
                            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelSection>
              </div>

              {selected.notes ? (
                <PanelSection title="Notes">
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {selected.notes}
                  </p>
                </PanelSection>
              ) : null}

              <div
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--accent)", background: "var(--accent-subtle)" }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  <p className="text-[12px] font-semibold" style={{ color: "var(--accent)" }}>
                    Submission Insight
                  </p>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {selected.name} has a {selected.fundingRate}% funding rate with {formatCurrency(selected.averageDealSize)} average deal size.
                  Best fit for {selected.industries.slice(0, 2).join(" and ")} deals in the {formatCurrency(selected.minAmount)}–{formatCurrency(selected.maxAmount)} range.
                </p>
              </div>

              <p className="text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Placeholder data · Connect lender APIs for live submission tracking
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
