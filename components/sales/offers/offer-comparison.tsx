"use client";

import { Scale, X } from "lucide-react";

import { formatCurrency } from "@/components/marketing/shared/panel-section";
import { OfferStatusBadge } from "@/components/sales/shared/badges";
import type { OfferRecord } from "@/lib/sales/types";

type OfferComparisonProps = {
  businessName: string;
  offers: OfferRecord[];
  onClose?: () => void;
  compact?: boolean;
};

function bestFactor(offers: OfferRecord[]) {
  return Math.min(...offers.map((o) => o.factorRate));
}

function bestAmount(offers: OfferRecord[]) {
  return Math.max(...offers.map((o) => o.amount));
}

export function OfferComparison({ businessName, offers, onClose, compact }: OfferComparisonProps) {
  if (offers.length < 2) return null;

  const minFactor = bestFactor(offers);
  const maxAmount = bestAmount(offers);

  return (
    <div
      className={`rounded-lg border ${compact ? "" : "shadow-sm"}`}
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--accent)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Offer Comparison
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {businessName} · {offers.length} offers
            </p>
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="p-1" aria-label="Close comparison">
            <X className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 pr-3 font-medium">Lender</th>
              <th className="pb-2 pr-3 text-right font-medium">Amount</th>
              <th className="pb-2 pr-3 text-right font-medium">Factor Rate</th>
              <th className="pb-2 pr-3 font-medium">Term</th>
              <th className="pb-2 pr-3 font-medium">Frequency</th>
              <th className="pb-2 pr-3 text-right font-medium">Daily Pmt</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              <th className="pb-2 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const isBestFactor = offer.factorRate === minFactor;
              const isBestAmount = offer.amount === maxAmount;
              return (
                <tr
                  key={offer.id}
                  className="border-t"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: isBestFactor ? "var(--success-subtle)" : undefined,
                  }}
                >
                  <td className="py-2.5 pr-3">
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {offer.lender}
                    </span>
                    {isBestFactor ? (
                      <span
                        className="ml-1.5 rounded px-1 py-0.5 text-[9px] font-semibold uppercase"
                        style={{ background: "var(--success)", color: "white" }}
                      >
                        Best Rate
                      </span>
                    ) : null}
                    {isBestAmount && !isBestFactor ? (
                      <span
                        className="ml-1.5 rounded px-1 py-0.5 text-[9px] font-semibold uppercase"
                        style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                      >
                        Highest $
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums font-medium">
                    {formatCurrency(offer.amount)}
                  </td>
                  <td
                    className="py-2.5 pr-3 text-right tabular-nums font-semibold"
                    style={{ color: isBestFactor ? "var(--success)" : "var(--accent)" }}
                  >
                    {offer.factorRate.toFixed(2)}
                  </td>
                  <td className="py-2.5 pr-3">{offer.term}</td>
                  <td className="py-2.5 pr-3">{offer.paymentFrequency}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {offer.dailyPayment ? `$${offer.dailyPayment}` : "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <OfferStatusBadge status={offer.status} />
                  </td>
                  <td className="py-2.5 tabular-nums" style={{ color: offer.daysUntilExpiry <= 3 ? "var(--danger)" : "var(--text-tertiary)" }}>
                    {offer.expirationDate}
                    {offer.daysUntilExpiry <= 7 ? ` (${offer.daysUntilExpiry}d)` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="border-t px-4 py-2.5 text-[11px]"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        Recommended: <strong style={{ color: "var(--success)" }}>
          {offers.find((o) => o.factorRate === minFactor)?.lender}
        </strong> offers the lowest factor rate at {minFactor.toFixed(2)}.
      </div>
    </div>
  );
}
