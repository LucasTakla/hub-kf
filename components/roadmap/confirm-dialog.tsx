"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={onCancel} aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5 shadow-2xl"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
            style={{ background: destructive ? "var(--danger)" : "var(--accent)" }}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
