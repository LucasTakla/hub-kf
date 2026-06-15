import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { readHubSession } from "@/lib/auth/hub-session";
import { resolveHubAccessFromSources } from "@/lib/auth/resolve-hub-access";

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

  const user = await currentUser();
  const { canAccessExecutive } = await resolveHubAccessFromSources({
    userId,
    email: user?.primaryEmailAddress?.emailAddress,
    name: user?.fullName,
    metadataRole: user?.publicMetadata?.hubRole ?? user?.publicMetadata?.role,
  });

  if (!canAccessExecutive) redirect("/overview");

  return children;
}
