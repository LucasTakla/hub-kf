import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { readHubSession, writeHubSession } from "@/lib/auth/hub-session";
import { resolveHubAccessFromSources } from "@/lib/auth/resolve-hub-access";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cached = await readHubSession(userId);
  if (cached?.synced) {
    return NextResponse.json({ ok: true, cached: true });
  }

  const user = await currentUser();
  const context = await resolveHubAccessFromSources({
    userId,
    email: user?.primaryEmailAddress?.emailAddress,
    name: user?.fullName,
    metadataRole: user?.publicMetadata?.hubRole ?? user?.publicMetadata?.role,
  });

  await writeHubSession({
    uid: userId,
    exec: context.canAccessExecutive,
    synced: true,
  });

  return NextResponse.json({ ok: true });
}
