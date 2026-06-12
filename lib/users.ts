import type { User, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function upsertUserFromClerk(input: {
  clerkId: string;
  email: string;
  name?: string | null;
}): Promise<User> {
  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId: input.clerkId },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { clerkId: input.clerkId },
      data: {
        email: input.email,
        name: input.name ?? undefined,
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { email: input.email },
      data: {
        clerkId: input.clerkId,
        name: input.name ?? undefined,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId: input.clerkId,
      email: input.email,
      name: input.name ?? undefined,
    },
  });
}
