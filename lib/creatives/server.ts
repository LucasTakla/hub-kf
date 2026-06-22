import { unlink } from "fs/promises";

import type { CreativeStatus, CreativeType, LeadNationality, Prisma } from "@prisma/client";

import { getCreativeAssetPath, getCreativeAssetUrl } from "@/lib/creatives/storage";
import type {
  CreativeInput,
  CreativeListFilters,
  CreativeRecord,
  CreativeUpdateInput,
} from "@/lib/creatives/types";
import { prisma } from "@/lib/prisma";

function withAssetUrl<T extends { fileName: string }>(creative: T): T & { assetUrl: string } {
  return {
    ...creative,
    assetUrl: getCreativeAssetUrl(creative.fileName),
  };
}

export async function listCreatives(filters: CreativeListFilters = {}): Promise<{
  items: CreativeRecord[];
  total: number;
}> {
  const where: Prisma.CreativeWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters.nationality && filters.nationality !== "all") {
    where.nationality = filters.nationality;
  }
  if (filters.type && filters.type !== "all") {
    where.type = filters.type;
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { metaAdName: { contains: q, mode: "insensitive" } },
      { script: { contains: q, mode: "insensitive" } },
      { creator: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.creative.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 100,
      skip: filters.offset ?? 0,
    }),
    prisma.creative.count({ where }),
  ]);

  return {
    items: items.map(withAssetUrl),
    total,
  };
}

export async function getCreativeById(id: string): Promise<CreativeRecord | null> {
  const creative = await prisma.creative.findUnique({ where: { id } });
  return creative ? withAssetUrl(creative) : null;
}

export async function createCreative(input: CreativeInput): Promise<CreativeRecord> {
  const creative = await prisma.creative.create({
    data: {
      name: input.name.trim(),
      type: input.type ?? inferTypeFromMime(input.mimeType),
      status: input.status ?? "DRAFT",
      nationality: input.nationality ?? undefined,
      metaAdName: input.metaAdName?.trim() || undefined,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      script: input.script?.trim() || undefined,
      tags: input.tags ?? [],
      creator: input.creator?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
    },
  });

  return withAssetUrl(creative);
}

export async function updateCreative(
  id: string,
  input: CreativeUpdateInput,
): Promise<CreativeRecord> {
  const creative = await prisma.creative.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      type: input.type,
      status: input.status,
      nationality: input.nationality === null ? null : input.nationality,
      metaAdName: input.metaAdName === null ? null : input.metaAdName?.trim(),
      script: input.script === null ? null : input.script?.trim(),
      tags: input.tags,
      creator: input.creator === null ? null : input.creator?.trim(),
      notes: input.notes === null ? null : input.notes?.trim(),
    },
  });

  return withAssetUrl(creative);
}

export async function deleteCreative(id: string): Promise<void> {
  const creative = await prisma.creative.findUnique({ where: { id } });
  if (!creative) return;

  await prisma.creative.delete({ where: { id } });

  try {
    await unlink(getCreativeAssetPath(creative.fileName));
  } catch {
    // File may already be missing on disk.
  }
}

function inferTypeFromMime(mimeType: string): CreativeType {
  if (mimeType.startsWith("image/")) return "IMAGE";
  return "VIDEO";
}

export function parseTagsInput(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseNationality(value: string | null | undefined): LeadNationality | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === "PT" || normalized === "ES" || normalized === "EN") {
    return normalized;
  }
  return null;
}

export function parseCreativeStatus(value: string | null | undefined): CreativeStatus | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toUpperCase() as CreativeStatus;
  const allowed: CreativeStatus[] = ["DRAFT", "APPROVED", "LIVE", "ARCHIVED", "TESTING"];
  return allowed.includes(normalized) ? normalized : undefined;
}

export function parseCreativeType(value: string | null | undefined): CreativeType | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toUpperCase() as CreativeType;
  const allowed: CreativeType[] = ["VIDEO", "UGC", "IMAGE", "STATIC"];
  return allowed.includes(normalized) ? normalized : undefined;
}
