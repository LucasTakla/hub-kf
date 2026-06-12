"use client";

import type { Release, RoadmapItem } from "@prisma/client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { DatePicker } from "@/components/roadmap/date-picker";
import { createRoadmapItem } from "@/lib/roadmap-api";

type TaskFormModalProps = {
  open: boolean;
  defaultLane: string;
  releases: Release[];
  onClose: () => void;
  onCreated: (item: RoadmapItem) => void;
};

const inputClass =
  "w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[var(--accent)]";

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TaskFormModal({
  open,
  defaultLane,
  releases,
  onClose,
  onCreated,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RoadmapItem["status"]>("PLANNED");
  const [priority, setPriority] = useState<RoadmapItem["priority"]>("P1");
  const [owner, setOwner] = useState("");
  const [lane, setLane] = useState(defaultLane);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState(todayIso());
  const [targetDate, setTargetDate] = useState(defaultDueDate());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLane(defaultLane);
      setTitle("");
      setDescription("");
      setStatus("PLANNED");
      setPriority("P1");
      setOwner("");
      setProgress(0);
      setStartDate(todayIso());
      setTargetDate(defaultDueDate());
      setError(null);
    }
  }, [open, defaultLane]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const item = await createRoadmapItem({
        title: title.trim(),
        description: description.trim() || null,
        lane,
        status,
        priority,
        owner: owner.trim() || null,
        progress,
        startDate,
        targetDate,
      });
      onCreated(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
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
            New task
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
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RoadmapItem["status"])}
                  className={inputClass}
                  style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RoadmapItem["priority"])}
                  className={inputClass}
                  style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Owner
              </label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Assign owner"
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Release
              </label>
              <select
                value={lane}
                onChange={(e) => setLane(e.target.value)}
                className={inputClass}
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                {releases.map((release) => (
                  <option key={release.slug} value={release.slug}>
                    {release.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Start date
                </label>
                <DatePicker value={startDate} onChange={(v) => v && setStartDate(v)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Due date
                </label>
                <DatePicker value={targetDate} onChange={(v) => v && setTargetDate(v)} required />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Progress — {progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </form>

        <div
          className="flex justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-default)" }}
        >
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
            {saving ? "Creating..." : "Create task"}
          </button>
        </div>
      </div>
    </>
  );
}
