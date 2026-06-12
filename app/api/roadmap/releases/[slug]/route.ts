import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

type RouteParams = { params: Promise<{ slug: string }> };

type PatchBody = {
  label?: string;
  subtitle?: string | null;
  description?: string | null;
  owner?: string | null;
  color?: string;
  startDate?: string;
  targetDate?: string;
  completedAt?: string | null;
  sortOrder?: number;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const body = (await request.json()) as PatchBody;

  const existing = await prisma.release.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.label !== undefined && body.label.trim() !== existing.label) {
    data.label = body.label.trim();
    data.slug = await uniqueSlug(body.label, async (candidate) => {
      if (candidate === slug) return false;
      const found = await prisma.release.findUnique({ where: { slug: candidate } });
      return Boolean(found);
    });
  }
  if (body.subtitle !== undefined) data.subtitle = body.subtitle;
  if (body.description !== undefined) data.description = body.description;
  if (body.owner !== undefined) data.owner = body.owner;
  if (body.color !== undefined) data.color = body.color;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.targetDate !== undefined) data.targetDate = new Date(body.targetDate);
  if (body.completedAt !== undefined) {
    data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
  }
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  const updated = await prisma.release.update({
    where: { slug },
    data,
  });

  if (data.slug && data.slug !== slug) {
    await prisma.roadmapItem.updateMany({
      where: { lane: slug },
      data: { lane: String(data.slug) },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  const existing = await prisma.release.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const itemCount = await prisma.roadmapItem.count({ where: { lane: slug } });
  if (itemCount > 0) {
    return NextResponse.json(
      { error: "Release has tasks. Move or delete them first." },
      { status: 409 },
    );
  }

  await prisma.release.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
