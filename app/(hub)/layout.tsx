import { auth, currentUser } from "@clerk/nextjs/server";

import { readHubSession } from "@/lib/auth/hub-session";
import { resolveHubAccess } from "@/lib/auth/resolve-hub-access";

import { HubShell } from "@/components/hub/hub-shell";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  let canAccessExecutive = false;

  if (userId) {
    const cached = await readHubSession(userId);
    if (cached?.synced) {
      canAccessExecutive = cached.exec;
    } else {
      const user = await currentUser();
      const { canAccessExecutive: hasExecutiveAccess } = await resolveHubAccess({
        userId,
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
        metadataRole: user?.publicMetadata?.hubRole ?? user?.publicMetadata?.role,
      });
      canAccessExecutive = hasExecutiveAccess;
    }
  }

  return <HubShell canAccessExecutive={canAccessExecutive}>{children}</HubShell>;
}
