import { auth, currentUser } from "@clerk/nextjs/server";

import { resolveExecutiveAccess } from "@/lib/auth/access";

import { HubShell } from "@/components/hub/hub-shell";
import { upsertUserFromClerk } from "@/lib/users";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (userId && user?.primaryEmailAddress?.emailAddress) {
    try {
      await upsertUserFromClerk({
        clerkId: userId,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
      });
    } catch (error) {
      console.error("Failed to sync user to database:", error);
    }
  }

  const canAccessExecutive = await resolveExecutiveAccess();

  return <HubShell canAccessExecutive={canAccessExecutive}>{children}</HubShell>;
}
