import type { ReactNode } from "react";

type PanelSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PanelSection({ title, description, action, children }: PanelSectionProps) {
  return (
    <section
      className="rounded-lg border"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div
        className="flex items-start justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function ModuleHeader({
  title,
  purpose,
}: {
  title: string;
  purpose: string;
}) {
  return (
    <div
      className="shrink-0 border-b px-4 py-3"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--accent)" }}>
        {title}
      </p>
      <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {purpose}
      </p>
    </div>
  );
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatRoas(value: number) {
  return `${value.toFixed(1)}x`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
