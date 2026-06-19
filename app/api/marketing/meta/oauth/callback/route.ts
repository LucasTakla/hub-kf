import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  exchangeForLongLivedMetaToken,
  exchangeMetaOAuthCode,
  saveMetaConnectionConfig,
} from "@/lib/meta/connection";
import { fetchMetaAdAccounts } from "@/lib/meta/insights";

const STATE_COOKIE = "meta_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/settings?meta=error`);
  }

  cookieStore.delete(STATE_COOKIE);

  try {
    const shortLived = await exchangeMetaOAuthCode(code);
    const longLived = await exchangeForLongLivedMetaToken(shortLived.accessToken);
    const accounts = await fetchMetaAdAccounts(longLived.accessToken);
    const primaryAccount = accounts[0];

    if (!primaryAccount) {
      return NextResponse.redirect(`${appUrl}/settings?meta=no-account`);
    }

    await saveMetaConnectionConfig({
      accessToken: longLived.accessToken,
      adAccountId: primaryAccount.accountId,
      tokenExpiresAt: longLived.expiresIn
        ? new Date(Date.now() + longLived.expiresIn * 1000).toISOString()
        : null,
    });

    return NextResponse.redirect(`${appUrl}/settings?meta=connected`);
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?meta=error`);
  }
}
