import { Construction } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  phase?: string;
};

export function PlaceholderPage({
  title,
  description,
  phase = "Coming soon",
}: PlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
      {phase ? (
        <span
          className="mb-4 inline-flex rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
          style={{
            background: "var(--bg-muted)",
            color: "var(--text-tertiary)",
          }}
        >
          {phase}
        </span>
      ) : null}
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <Construction className="h-5 w-5" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      <p className="mt-4 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
        Track delivery on the{" "}
        <a href="/roadmap" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
          Roadmap
        </a>
        {" "}or return to{" "}
        <a href="/overview" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
          Overview
        </a>
        .
      </p>
    </div>
  );
}
