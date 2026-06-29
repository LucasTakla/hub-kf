"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { OFFER_STATUSES } from "@/lib/sales/constants";
import type { Deal, OfferStatus } from "@/lib/sales/types";

type AddOfferFormProps = {
  deals: Deal[];
  onComplete: () => Promise<void> | void;
};

export function AddOfferForm({ deals, onComplete }: AddOfferFormProps) {
  const [open, setOpen] = useState(false);
  const [dealId, setDealId] = useState("");
  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState("");
  const [factorRate, setFactorRate] = useState("");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<OfferStatus>("received");
  const [expirationDate, setExpirationDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (!dealId || !lender.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Choose a deal, lender, and valid amount.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/deals/${dealId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lender: lender.trim(),
          amount: parsedAmount,
          factorRate: factorRate ? Number.parseFloat(factorRate) : undefined,
          term: term.trim() || undefined,
          status,
          expirationDate: expirationDate || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to save offer");

      setOpen(false);
      setDealId("");
      setLender("");
      setAmount("");
      setFactorRate("");
      setTerm("");
      setStatus("received");
      setExpirationDate("");
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save offer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium"
        style={{
          background: "var(--accent-subtle)",
          borderColor: "var(--accent)",
          color: "var(--accent)",
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Log offer
      </button>

      {open ? (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-2 w-full max-w-md rounded-lg border p-3 text-left"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <p className="mb-3 text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            Log funding offer in Hub
          </p>
          <div className="space-y-2.5">
            <select
              value={dealId}
              onChange={(event) => setDealId(event.target.value)}
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            >
              <option value="">Select deal</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.businessName} · {deal.owner}
                </option>
              ))}
            </select>
            <input
              value={lender}
              onChange={(event) => setLender(event.target.value)}
              placeholder="Lender name"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
                inputMode="decimal"
                className="rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
              />
              <input
                value={factorRate}
                onChange={(event) => setFactorRate(event.target.value)}
                placeholder="Factor rate"
                inputMode="decimal"
                className="rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
              />
            </div>
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Term (e.g. 12 months)"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OfferStatus)}
              className="w-full rounded-md border px-2 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            >
              {OFFER_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={expirationDate}
              onChange={(event) => setExpirationDate(event.target.value)}
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-3 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Saving..." : "Save offer"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="max-w-[280px] text-right text-[10px]" style={{ color: "var(--danger)" }}>{error}</p>
      ) : null}
    </div>
  );
}
