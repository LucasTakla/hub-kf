import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildMetaOAuthUrl, isMetaOAuthConfigured } from "@/lib/meta/connection";

const STATE_COOKIE = "meta_oauth_state";

export async function GET() {
  if (!isMetaOAuthConfigured()) {
    return NextResponse.json({ error: "Meta OAuth is not configured" }, { status: 503 });
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildMetaOAuthUrl(state));
}
