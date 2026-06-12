"use client";

import type { Release } from "@prisma/client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { DatePicker } from "@/components/roadmap/date-picker";
import { ConfirmDialog } from "@/components/roadmap/confirm-dialog";
import { createRelease, deleteRelease, updateRelease } from "@/lib/roadmap-api";
import { toDate } from "@/lib/roadmap";

const RELEASE_COLORS = [
  "#0c5ded",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#db2777",
];

type ReleaseFormModalProps = {
  open: boolean;
  release: Release | null;
  onClose: () => void;
  onSaved: (release: Release, previousSlug?: string) => void;
  onDeleted: (slug: string) => void;
};

const inputClass =
  "w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[var(--accent)]";

function defaultDates() {
  const start = new Date();
  const target = new Date();
  target.setMonth(target.getMonth() + 2);
  return {
    start: start.toISOString().slice(0, 10),
    target: target.toISOString().slice(0, 10),
  };
}

export function ReleaseFormModal({
  open,
  release,
  onClose,
  onSaved,
  onDeleted,
}: ReleaseFormModalProps) {
  const isEdit = Boolean(release);
  const defaults = defaultDates();

  const [label, setLabel] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [color, setColor] = useState(RELEASE_COLORS[0]);
  const [startDate, setStartDate] = useState(defaults.start);
  const [targetDate, setTargetDate] = useState(defaults.target);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (release) {
      setLabel(release.label);
      setSubtitle(release.subtitle ?? "");
      setDescription(release.description ?? "");
      setOwner(release.owner ?? "");
      setColor(release.color ?? RELEASE_COLORS[0]);
      setStartDate(toDate(release.startDate).toISOString().slice(0, 10));
      setTargetDate(toDate(release.targetDate).toISOString().slice(0, 10));
      setCompletedAt(
        release.completedAt ? toDate(release.completedAt).toISOString().slice(0, 10) : null,
      );
    } else {
      const d = defaultDates();
      setLabel("");
      setSubtitle("");
      setDescription("");
      setOwner("");
      setColor(RELEASE_COLORS[0]);
      setStartDate(d.start);
      setTargetDate(d.target);
      setCompletedAt(null);
    }
    setError(null);
    setConfirmDelete(false);
  }, [open, release]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim()) {
      setError("Release name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isEdit && release) {
        const updated = await updateRelease(release.slug, {
          label: label.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim() || null,
          owner: owner.trim() || null,
          color,
          startDate,
          targetDate,
          completedAt,
        });
        onSaved(updated, release.slug);
      } else {
        const created = await createRelease({
          label: label.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim() || null,
          owner: owner.trim() || null,
          color,
          startDate,
          targetDate,
        });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save release");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!release) return;
    setSaving(true);
    try {
      await deleteRelease(release.slug);
      onDeleted(release.slug);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete release");
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose} aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border shadow-2xl"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border-default)" }}
        >
          <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Edit release" : "New release"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 overflow-y-auto px-5 py-4 enterprise-scroll">
          {error ? (
            <p className="mb-3 text-[12px]" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          ) : null}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Release name
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="V5 Finance or Q3 2026"
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Subtitle
              </label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Short label shown on columns"
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Owner
              </label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {RELEASE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2"
                    style={{
                      background: c,
                      borderColor: color === c ? "var(--text-primary)" : "transparent",
                    }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Start date
                </label>
                <DatePicker value={startDate} onChange={(v) => v && setStartDate(v)} required />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Target date
                </label>
                <DatePicker value={targetDate} onChange={(v) => v && setTargetDate(v)} required />
              </div>
            </div>

            {isEdit ? (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Completion date
                </label>
                <DatePicker value={completedAt} onChange={setCompletedAt} />
              </div>
            ) : null}
          </div>
        </form>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          {isEdit ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[12px] font-medium"
              style={{ color: "var(--danger)" }}
            >
              Delete release
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={(e) => void handleSubmit(e)}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Saving..." : isEdit ? "Save release" : "Create release"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete release?"
        message="This release will be permanently removed. It must have no tasks assigned."
        confirmLabel="Delete"
        destructive
        loading={saving}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
