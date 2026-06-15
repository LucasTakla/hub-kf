import { cookies } from "next/headers";

const HUB_SESSION_COOKIE = "kf_hub_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

type HubSessionPayload = {
  uid: string;
  exec: boolean;
  synced: boolean;
};

function parseSession(raw: string | undefined): HubSessionPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HubSessionPayload;
    if (typeof parsed.uid !== "string") return null;
    if (typeof parsed.exec !== "boolean") return null;
    if (typeof parsed.synced !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readHubSession(userId: string): Promise<HubSessionPayload | null> {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(HUB_SESSION_COOKIE)?.value);
  if (!session || session.uid !== userId) return null;
  return session;
}

export async function writeHubSession(payload: HubSessionPayload): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(HUB_SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearHubSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(HUB_SESSION_COOKIE);
}
