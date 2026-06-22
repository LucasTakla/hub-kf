"use client";

import type { CreativeStatus, CreativeType, LeadNationality } from "@prisma/client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { CREATIVE_STATUSES, CREATIVE_TYPES } from "@/lib/creatives/types";
import { LEAD_NATIONALITIES } from "@/lib/leads/nationality";

type CreativeUploadPanelProps = {
  onComplete: () => Promise<void> | void;
};

export function CreativeUploadPanel({ onComplete }: CreativeUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CreativeType>("VIDEO");
  const [status, setStatus] = useState<CreativeStatus>("DRAFT");
  const [nationality, setNationality] = useState<LeadNationality | "">("");
  const [metaAdName, setMetaAdName] = useState("");
  const [tags, setTags] = useState("");
  const [script, setScript] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Choose a video or image file first.");
      return;
    }

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", name.trim() || selectedFile.name.replace(/\.[^.]+$/, ""));
      formData.append("type", type);
      formData.append("status", status);
      if (nationality) formData.append("nationality", nationality);
      if (metaAdName.trim()) formData.append("metaAdName", metaAdName.trim());
      if (tags.trim()) formData.append("tags", tags.trim());
      if (script.trim()) formData.append("script", script.trim());

      const response = await fetch("/api/creatives", { method: "POST", body: formData });
      let payload: { error?: string; creative?: { name: string } } = {};
      try {
        payload = (await response.json()) as typeof payload;
      } catch {
        throw new Error(`Upload failed (${response.status}). Check server logs on Hostinger.`);
      }

      if (!response.ok) {
        throw new Error(payload.error ?? `Upload failed (${response.status})`);
      }

      setMessage(`Uploaded "${payload.creative?.name ?? name}".`);
      setOpen(false);
      setName("");
      setMetaAdName("");
      setTags("");
      setScript("");
      setSelectedFile(null);
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
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
        <Upload className="h-3.5 w-3.5" />
        Upload creative
      </button>

      {open ? (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-2 w-full max-w-md rounded-lg border p-3 text-left"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <p className="mb-3 text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
            Upload to Hostinger storage
          </p>

          <div className="space-y-2.5">
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                setError(null);
                if (file && !name.trim()) {
                  setName(file.name.replace(/\.[^.]+$/, ""));
                }
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors hover:opacity-90"
              style={{
                borderColor: selectedFile ? "var(--success)" : "var(--accent)",
                background: selectedFile ? "var(--success-subtle)" : "var(--accent-subtle)",
              }}
            >
              <Upload
                className="mb-2 h-6 w-6"
                style={{ color: selectedFile ? "var(--success)" : "var(--accent)" }}
              />
              <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                {selectedFile ? selectedFile.name : "Click to select video or image"}
              </span>
              <span className="mt-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                MP4, WebM, MOV, JPG, PNG, WebP · max 200 MB
              </span>
            </button>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Creative name"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={type}
                onChange={(event) => setType(event.target.value as CreativeType)}
                className="rounded-md border px-2 py-1.5 text-[12px]"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
              >
                {CREATIVE_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as CreativeStatus)}
                className="rounded-md border px-2 py-1.5 text-[12px]"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
              >
                {CREATIVE_STATUSES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>

            <select
              value={nationality}
              onChange={(event) => setNationality(event.target.value as LeadNationality | "")}
              className="w-full rounded-md border px-2 py-1.5 text-[12px]"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            >
              <option value="">No market</option>
              {LEAD_NATIONALITIES.map((item) => (
                <option key={item.id} value={item.id}>{item.id} — {item.description}</option>
              ))}
            </select>

            <input
              value={metaAdName}
              onChange={(event) => setMetaAdName(event.target.value)}
              placeholder="Meta ad name (must match Ads Manager)"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />

            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full rounded-md border px-2.5 py-1.5 text-[12px] outline-none"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-muted)" }}
            />

            <textarea
              value={script}
              onChange={(event) => setScript(event.target.value)}
              placeholder="Script or brief (optional)"
              rows={3}
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
              disabled={uploading}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              {uploading ? "Uploading..." : "Save to library"}
            </button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p className="text-[10px]" style={{ color: "var(--success)" }}>{message}</p>
      ) : null}
      {error ? (
        <p className="max-w-[280px] text-right text-[10px]" style={{ color: "var(--danger)" }}>{error}</p>
      ) : null}
    </div>
  );
}
