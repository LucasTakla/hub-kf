export const ROADMAP_LANES = [
  { id: "v1", label: "V1 Foundation", subtitle: "Core platform" },
  { id: "v2", label: "V2 Operations", subtitle: "Visibility layer" },
  { id: "v3", label: "V3 Automation", subtitle: "Workflow orchestration" },
  { id: "v4", label: "V4 AI Agents", subtitle: "Intelligent automation" },
] as const;

export type RoadmapLaneId = (typeof ROADMAP_LANES)[number]["id"];

export const STAGES = [
  { id: "RESEARCH", label: "Research" },
  { id: "DEVELOPMENT", label: "Development" },
  { id: "TESTING", label: "Testing" },
  { id: "LAUNCH", label: "Launch" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export const TEAMS = ["Platform", "Engineering", "Growth", "Finance", "AI"] as const;

export type TeamName = (typeof TEAMS)[number];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function avatarColor(name: string): string {
  const colors = [
    "bg-blue-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export type ZoomLevel = "weeks" | "months" | "quarters";

export type RoadmapView = "board" | "timeline" | "releases";
