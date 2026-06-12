import type { ActivityModule } from "@/lib/operations/types";
import { MODULE_COLORS } from "@/lib/operations/constants";

const MODULE_LABELS: Record<ActivityModule, string> = {
  marketing: "Marketing",
  sales: "Sales",
  operations: "Operations",
  ai: "AI",
  executive: "Executive",
  roadmap: "Roadmap",
};

export function ModuleBadge({ module }: { module: ActivityModule }) {
  const color = MODULE_COLORS[module];
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium capitalize"
      style={{ background: `${color}18`, color }}
    >
      {MODULE_LABELS[module]}
    </span>
  );
}
