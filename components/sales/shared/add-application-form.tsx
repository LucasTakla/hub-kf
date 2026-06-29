"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { APPLICATION_STATUSES } from "@/lib/sales/constants";
import type { ApplicationStatus, Deal } from "@/lib/sales/types";

type AddApplicationFormProps = {
  deals: Deal[];
  onComplete: () => Promise<void> | void;
};

export function AddApplicationForm({ deals, onComplete }: AddApplicationFormProps) {
  const [open, setOpen] = useState(false);
  const [dealId, setDealId] = useState("");
  const [lender, setLender] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("submitted");
  const [assignedUser, setAssignedUser] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dealId || !lender.trim()) {
      setError("Choose a deal and enter a lender.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/deals/${dealId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lender: lender.trim(),
          status,
          assignedUser: assignedUser.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to save application");

      setOpen(false);
      setDealId("");
      setLender("");
      setStatus("submitted");
      setAssignedUser("");
      setNotes("");
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application");
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
        Log application
      </button>

      {open ? (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-2 w-full max-w-md rounded-lg border p-3 text-left"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <p className="mb-3 text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            Log lender submission in Hub
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
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
              className="w-full rounded-md border px-2 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            >
              {APPLICATION_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <input
              value={assignedUser}
              onChange={(event) => setAssignedUser(event.target.value)}
              placeholder="Assigned user (optional)"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full resize-none rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
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
              {saving ? "Saving..." : "Save application"}
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
