import { cache } from "react";
import type { User } from "@prisma/client";

import { readHubSession, writeHubSession } from "@/lib/auth/hub-session";
import { canAccessExecutive } from "@/lib/auth/roles";
import { getUserByClerkId, upsertUserFromClerk } from "@/lib/users";

export type HubAccessContext = {
  canAccessExecutive: boolean;
};

type ResolveHubAccessInput = {
  userId: string;
  email?: string | null;
  name?: string | null;
  metadataRole?: unknown;
};

export const getCachedUserByClerkId = cache(getUserByClerkId);

export async function resolveHubAccess(
  input: ResolveHubAccessInput,
): Promise<HubAccessContext> {
  const cached = await readHubSession(input.userId);
  if (cached?.synced) {
    return { canAccessExecutive: cached.exec };
  }

  const dbUser = await ensureUserSynced(input);
  const canAccess = canAccessExecutive(dbUser?.role, input.metadataRole);

  await writeHubSession({
    uid: input.userId,
    exec: canAccess,
    synced: true,
  });

  return { canAccessExecutive: canAccess };
}

async function ensureUserSynced(input: ResolveHubAccessInput): Promise<User | null> {
  let dbUser = await getCachedUserByClerkId(input.userId);

  if (!dbUser && input.email) {
    return upsertUserFromClerk({
      clerkId: input.userId,
      email: input.email,
      name: input.name,
    });
  }

  if (dbUser && input.email) {
    const profileChanged =
      dbUser.email !== input.email || (input.name != null && dbUser.name !== input.name);

    if (profileChanged) {
      dbUser = await upsertUserFromClerk({
        clerkId: input.userId,
        email: input.email,
        name: input.name,
      });
    }
  }

  return dbUser;
}
