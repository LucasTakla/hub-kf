import type { Release, RoadmapItem } from "@prisma/client";

import { hydrateRelease, hydrateRoadmapItem } from "@/lib/roadmap";

export type CreateRoadmapItemInput = {
  title: string;
  description?: string | null;
  lane: string;
  priority?: RoadmapItem["priority"];
  status?: RoadmapItem["status"];
  progress?: number;
  owner?: string | null;
  startDate?: string | null;
  targetDate: string;
};

export type UpdateRoadmapItemInput = Partial<{
  title: string;
  description: string | null;
  lane: string;
  priority: RoadmapItem["priority"];
  status: RoadmapItem["status"];
  stage: RoadmapItem["stage"];
  confidence: RoadmapItem["confidence"];
  progress: number;
  owner: string | null;
  team: string | null;
  startDate: string | null;
  targetDate: string;
  completedAt: string | null;
  dependsOnIds: string | null;
  dependencies: string | null;
  sortOrder: number;
}>;

export type CreateReleaseInput = {
  label: string;
  subtitle?: string | null;
  description?: string | null;
  owner?: string | null;
  color?: string;
  startDate: string;
  targetDate: string;
};

export type UpdateReleaseInput = Partial<{
  label: string;
  subtitle: string | null;
  description: string | null;
  owner: string | null;
  color: string;
  startDate: string;
  targetDate: string;
  completedAt: string | null;
  sortOrder: number;
}>;

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function createRoadmapItem(data: CreateRoadmapItemInput): Promise<RoadmapItem> {
  const response = await fetch("/api/roadmap/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return hydrateRoadmapItem(await parseJson(response));
}

export async function updateRoadmapItem(
  id: string,
  data: UpdateRoadmapItemInput,
): Promise<RoadmapItem> {
  const response = await fetch(`/api/roadmap/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return hydrateRoadmapItem(await parseJson(response));
}

export async function deleteRoadmapItem(id: string): Promise<void> {
  const response = await fetch(`/api/roadmap/items/${id}`, { method: "DELETE" });
  await parseJson(response);
}

export async function duplicateRoadmapItem(id: string): Promise<RoadmapItem> {
  const response = await fetch(`/api/roadmap/items/${id}/duplicate`, { method: "POST" });
  return hydrateRoadmapItem(await parseJson(response));
}

export async function reorderRoadmapItems(
  lane: string,
  itemIds: string[],
): Promise<RoadmapItem[]> {
  const response = await fetch("/api/roadmap/items/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lane, itemIds }),
  });
  const items = await parseJson<RoadmapItem[]>(response);
  return items.map(hydrateRoadmapItem);
}

export async function createRelease(data: CreateReleaseInput): Promise<Release> {
  const response = await fetch("/api/roadmap/releases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return hydrateRelease(await parseJson(response));
}

export async function updateRelease(
  slug: string,
  data: UpdateReleaseInput,
): Promise<Release> {
  const response = await fetch(`/api/roadmap/releases/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return hydrateRelease(await parseJson(response));
}

export async function deleteRelease(slug: string): Promise<void> {
  const response = await fetch(`/api/roadmap/releases/${slug}`, { method: "DELETE" });
  await parseJson(response);
}

export async function reorderReleases(slugs: string[]): Promise<Release[]> {
  const response = await fetch("/api/roadmap/releases/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs }),
  });
  const releases = await parseJson<Release[]>(response);
  return releases.map(hydrateRelease);
}

export async function markItemComplete(id: string): Promise<RoadmapItem> {
  return updateRoadmapItem(id, {
    status: "DONE",
    progress: 100,
    completedAt: new Date().toISOString(),
  });
}
