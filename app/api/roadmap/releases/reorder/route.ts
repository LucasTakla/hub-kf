import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type ReorderBody = {
  slugs: string[];
};

export async function PATCH(request: Request) {
  const body = (await request.json()) as ReorderBody;

  if (!Array.isArray(body.slugs)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.$transaction(
    body.slugs.map((slug, index) =>
      prisma.release.update({
        where: { slug },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  const releases = await prisma.release.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(releases);
}
