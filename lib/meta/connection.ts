import { Prisma } from "@prisma/client";

import type { MetaConnectionConfig } from "@/lib/meta/types";
import { prisma } from "@/lib/prisma";

const META_SLUG = "meta-ads";

export async function getMetaConnectionConfig(): Promise<MetaConnectionConfig | null> {
  const integration = await prisma.integration.findUnique({ where: { slug: META_SLUG } });
  const dbConfig = integration?.config as MetaConnectionConfig | null | undefined;

  if (dbConfig?.accessToken && dbConfig?.adAccountId) {
    return {
      accessToken: dbConfig.accessToken,
      adAccountId: dbConfig.adAccountId.replace(/^act_/, ""),
      tokenExpiresAt: dbConfig.tokenExpiresAt ?? null,
      connectedBy: dbConfig.connectedBy ?? null,
    };
  }

  const envToken = process.env.META_ACCESS_TOKEN;
  const envAccount = process.env.META_AD_ACCOUNT_ID?.replace(/^act_/, "");
  if (envToken && envAccount) {
    return {
      accessToken: envToken,
      adAccountId: envAccount,
    };
  }

  return null;
}

export async function saveMetaConnectionConfig(
  config: MetaConnectionConfig,
): Promise<void> {
  await prisma.integration.upsert({
    where: { slug: META_SLUG },
    update: {
      status: "CONNECTED",
      config: {
        accessToken: config.accessToken,
        adAccountId: config.adAccountId.replace(/^act_/, ""),
        tokenExpiresAt: config.tokenExpiresAt ?? null,
        connectedBy: config.connectedBy ?? null,
      },
      lastSyncAt: new Date(),
    },
    create: {
      slug: META_SLUG,
      name: "Meta Ads",
      description: "Facebook & Instagram ad spend and performance",
      status: "CONNECTED",
      config: {
        accessToken: config.accessToken,
        adAccountId: config.adAccountId.replace(/^act_/, ""),
        tokenExpiresAt: config.tokenExpiresAt ?? null,
        connectedBy: config.connectedBy ?? null,
      },
      lastSyncAt: new Date(),
    },
  });
}

export async function disconnectMetaConnection(): Promise<void> {
  await prisma.integration.update({
    where: { slug: META_SLUG },
    data: {
      status: "NOT_CONNECTED",
      config: Prisma.DbNull,
    },
  });
}

export async function touchMetaSync(): Promise<void> {
  await prisma.integration.updateMany({
    where: { slug: META_SLUG },
    data: { lastSyncAt: new Date() },
  });
}

export function isMetaOAuthConfigured(): boolean {
  return Boolean(
    process.env.META_APP_ID &&
      process.env.META_APP_SECRET &&
      process.env.NEXT_PUBLIC_APP_URL,
  );
}

export function buildMetaOAuthUrl(state: string): string {
  const appId = process.env.META_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/meta/oauth/callback`;
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: "ads_read,read_insights",
    response_type: "code",
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeMetaOAuthCode(code: string): Promise<{
  accessToken: string;
  expiresIn?: number;
}> {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/meta/oauth/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`,
  );
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message: string };
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error?.message ?? "Failed to exchange Meta OAuth code");
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
  };
}

export async function exchangeForLongLivedMetaToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn?: number;
}> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`,
  );
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message: string };
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error?.message ?? "Failed to get long-lived Meta token");
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
  };
}
