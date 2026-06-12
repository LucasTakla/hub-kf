import type { ActivityModule, SopCategory } from "./types";

export const ACTIVITY_MODULES: { id: ActivityModule | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "operations", label: "Operations" },
  { id: "ai", label: "AI" },
  { id: "executive", label: "Executive" },
  { id: "roadmap", label: "Roadmap" },
];

export const SOP_CATEGORIES: { id: SopCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sales", label: "Sales" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operations" },
  { id: "ai", label: "AI" },
  { id: "executive", label: "Executive" },
];

export const MODULE_COLORS: Record<ActivityModule, string> = {
  marketing: "#0c5ded",
  sales: "#059669",
  operations: "#d97706",
  ai: "#8b5cf6",
  executive: "#0891b2",
  roadmap: "#ec4899",
};
