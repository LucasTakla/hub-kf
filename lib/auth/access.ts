import { auth, currentUser } from "@clerk/nextjs/server";

import { canAccessExecutive } from "@/lib/auth/roles";
import { getUserByClerkId } from "@/lib/users";

export async function resolveExecutiveAccess(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const [dbUser, clerkUser] = await Promise.all([
    getUserByClerkId(userId),
    currentUser(),
  ]);

  const metadataRole =
    clerkUser?.publicMetadata?.hubRole ?? clerkUser?.publicMetadata?.role;

  return canAccessExecutive(dbUser?.role, metadataRole);
}
