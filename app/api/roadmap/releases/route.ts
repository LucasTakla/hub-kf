import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

type PostBody = {
  label: string;
  subtitle?: string | null;
  description?: string | null;
  owner?: string | null;
  color?: string;
  startDate: string;
  targetDate: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;

  if (!body.label?.trim() || !body.startDate || !body.targetDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = await uniqueSlug(body.label, async (candidate) => {
    const found = await prisma.release.findUnique({ where: { slug: candidate } });
    return Boolean(found);
  });

  const maxSort = await prisma.release.aggregate({ _max: { sortOrder: true } });

  const created = await prisma.release.create({
    data: {
      slug,
      label: body.label.trim(),
      subtitle: body.subtitle ?? null,
      description: body.description ?? null,
      owner: body.owner ?? null,
      color: body.color ?? "#0c5ded",
      startDate: new Date(body.startDate),
      targetDate: new Date(body.targetDate),
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
