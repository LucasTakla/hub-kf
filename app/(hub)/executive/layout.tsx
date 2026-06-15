import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { readHubSession } from "@/lib/auth/hub-session";
import { resolveHubAccess } from "@/lib/auth/resolve-hub-access";

export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const cached = await readHubSession(userId);
  if (cached?.synced) {
    if (!cached.exec) redirect("/overview");
    return children;
  }

  const { canAccessExecutive } = await resolveHubAccess({ userId });
  if (!canAccessExecutive) redirect("/overview");

  return children;
}
