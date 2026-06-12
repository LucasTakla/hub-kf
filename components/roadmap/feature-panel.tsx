"use client";

import type { Release, RoadmapItem } from "@prisma/client";
import { CheckCircle2, Copy, Loader2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  ConfidenceBadge,
  PriorityBadge,
  ProgressBar,
  StatusBadge,
  TeamAvatar,
} from "@/components/roadmap/badges";
import { ConfirmDialog } from "@/components/roadmap/confirm-dialog";
import { DatePicker } from "@/components/roadmap/date-picker";
import { StagePipeline } from "@/components/roadmap/stage-pipeline";
import { formatDate } from "@/lib/format";
import {
  deleteRoadmapItem,
  duplicateRoadmapItem,
  markItemComplete,
  updateRoadmapItem,
} from "@/lib/roadmap-api";
import { parseDependsOnIds, stageLabels, toDate } from "@/lib/roadmap";
import { moduleLabels } from "@/lib/navigation";
import { TEAMS } from "@/lib/roadmap-constants";

type FeaturePanelProps = {
  item: RoadmapItem | null;
  allItems: RoadmapItem[];
  releases: Release[];
  onClose: () => void;
  onUpdate: (item: RoadmapItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: RoadmapItem) => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function FeaturePanel({
  item,
  allItems,
  releases,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: FeaturePanelProps) {
  const [draft, setDraft] = useState<RoadmapItem | null>(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(item);
    setError(null);
    setConfirmDelete(false);
  }, [item]);

  if (!item || !draft) return null;

  const dependencyIds = parseDependsOnIds(draft.dependsOnIds);
  const otherItems = allItems.filter((i) => i.id !== draft.id);

  async function save(fields: Parameters<typeof updateRoadmapItem>[1]) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRoadmapItem(draft.id, fields);
      setDraft(updated);
      onUpdate(updated);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await markItemComplete(draft.id);
      setDraft(updated);
      onUpdate(updated);
    } catch {
      setError("Failed to mark complete");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    if (!draft) return;
    setSaving(true);
    try {
      const copy = await duplicateRoadmapItem(draft.id);
      onDuplicate(copy);
    } catch {
      setError("Failed to duplicate task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!draft) return;
    setSaving(true);
    try {
      await deleteRoadmapItem(draft.id);
      onDelete(draft.id);
      onClose();
    } catch {
      setError("Failed to delete task");
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  }

  function toggleDependency(id: string) {
    if (!draft) return;
    const current = parseDependsOnIds(draft.dependsOnIds);
    const next = current.includes(id)
      ? current.filter((depId) => depId !== id)
      : [...current, id];
    const dependsOnIds = next.length ? next.join(",") : null;
    setDraft({ ...draft, dependsOnIds });
    void save({ dependsOnIds });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div
          className="flex items-start justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="min-w-0 flex-1 pr-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <PriorityBadge priority={draft.priority} />
              <StatusBadge status={draft.status} />
              <ConfidenceBadge confidence={draft.confidence} />
            </div>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              onBlur={() => {
                if (draft.title !== item.title) void save({ title: draft.title });
              }}
              className="w-full bg-transparent text-base font-semibold outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <p className="mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {moduleLabels[draft.module] ?? draft.module} · {draft.team ?? "No team"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: "var(--bg-muted)" }}
            aria-label="Close panel"
          >
            <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 enterprise-scroll">
          {error ? (
            <p className="mb-4 text-[12px]" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          ) : null}

          <section className="mb-5 space-y-3">
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => {
                  const status = e.target.value as RoadmapItem["status"];
                  setDraft({ ...draft, status });
                  void save({ status });
                }}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </select>
            </Field>

            <Field label="Release">
              <select
                value={draft.lane}
                onChange={(e) => {
                  setDraft({ ...draft, lane: e.target.value });
                  void save({ lane: e.target.value });
                }}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                {releases.map((release) => (
                  <option key={release.slug} value={release.slug}>
                    {release.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Owner">
              <div className="flex items-center gap-2">
                {draft.owner ? <TeamAvatar name={draft.owner} /> : null}
                <input
                  value={draft.owner ?? ""}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value || null })}
                  onBlur={() => {
                    if (draft.owner !== item.owner) void save({ owner: draft.owner });
                  }}
                  placeholder="Assign owner"
                  className={inputClass}
                  style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            </Field>

            <Field label="Team">
              <select
                value={draft.team ?? ""}
                onChange={(e) => {
                  const team = e.target.value || null;
                  setDraft({ ...draft, team });
                  void save({ team });
                }}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="">No team</option>
                {TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          <section className="mb-5">
            <Field label={`Progress — ${draft.progress}%`}>
              <input
                type="range"
                min={0}
                max={100}
                value={draft.progress}
                onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                onMouseUp={() => {
                  if (draft.progress !== item.progress) void save({ progress: draft.progress });
                }}
                onTouchEnd={() => {
                  if (draft.progress !== item.progress) void save({ progress: draft.progress });
                }}
                className="w-full"
              />
              <ProgressBar value={draft.progress} />
            </Field>
            <div className="mt-3">
              <StagePipeline stage={draft.stage} />
            </div>
            <select
              value={draft.stage}
              onChange={(e) => {
                const stage = e.target.value as RoadmapItem["stage"];
                setDraft({ ...draft, stage });
                void save({ stage });
              }}
              className={`${inputClass} mt-2`}
              style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              {Object.entries(stageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>

          <section
            className="mb-5 grid grid-cols-2 gap-3 rounded-lg border p-3"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
          >
            <Field label="Start date">
              <DatePicker
                value={draft.startDate}
                onChange={(startDate) => {
                  setDraft({ ...draft, startDate: startDate ? new Date(startDate) : null });
                  void save({ startDate });
                }}
              />
            </Field>
            <Field label="Due date">
              <DatePicker
                value={draft.targetDate}
                onChange={(targetDate) => {
                  if (!targetDate) return;
                  setDraft({ ...draft, targetDate: new Date(targetDate) });
                  void save({ targetDate });
                }}
                required
              />
            </Field>
            <Field label="Priority">
              <select
                value={draft.priority}
                onChange={(e) => {
                  const priority = e.target.value as RoadmapItem["priority"];
                  setDraft({ ...draft, priority });
                  void save({ priority });
                }}
                className={inputClass}
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </Field>
            <Field label="Confidence">
              <select
                value={draft.confidence}
                onChange={(e) => {
                  const confidence = e.target.value as RoadmapItem["confidence"];
                  setDraft({ ...draft, confidence });
                  void save({ confidence });
                }}
                className={inputClass}
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="AT_RISK">At risk</option>
              </select>
            </Field>
          </section>

          <section className="mb-5">
            <Field label="Completion date">
              <DatePicker
                value={draft.completedAt}
                onChange={(completedAt) => {
                  setDraft({
                    ...draft,
                    completedAt: completedAt ? new Date(completedAt) : null,
                  });
                  void save({ completedAt });
                }}
              />
            </Field>
            {draft.completedAt ? (
              <p className="mt-1 text-[11px]" style={{ color: "var(--success)" }}>
                Completed {formatDate(toDate(draft.completedAt))}
              </p>
            ) : null}
          </section>

          <section className="mb-5">
            <Field label="Description">
              <textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value || null })}
                onBlur={() => {
                  if (draft.description !== item.description) {
                    void save({ description: draft.description });
                  }
                }}
                rows={3}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </Field>
          </section>

          <section className="mb-5">
            <Field label="Dependencies">
              <div
                className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
              >
                {otherItems.map((other) => (
                  <label
                    key={other.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[12px] hover:opacity-80"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <input
                      type="checkbox"
                      checked={dependencyIds.includes(other.id)}
                      onChange={() => toggleDependency(other.id)}
                    />
                    <span className="truncate">{other.title}</span>
                  </label>
                ))}
              </div>
            </Field>
          </section>
        </div>

        <div
          className="flex items-center justify-between gap-3 border-t px-5 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium"
              style={{ color: "var(--danger)" }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              type="button"
              onClick={() => void handleDuplicate()}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {saving ? <Loader2 className="inline h-3 w-3 animate-spin" /> : null}
              {saving ? " Saving..." : "Auto-save"}
            </span>
            {draft.status !== "DONE" ? (
              <button
                type="button"
                onClick={() => void handleComplete()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
                style={{ background: "var(--success)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task?"
        message={`"${draft.title}" will be permanently removed from the roadmap.`}
        confirmLabel="Delete task"
        destructive
        loading={saving}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
