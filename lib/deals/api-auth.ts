export function getDealsSyncSecret(): string | null {
  return process.env.DEALS_SYNC_SECRET?.trim() || process.env.LEADS_INGEST_SECRET?.trim() || null;
}

export function getIngestSecretFromRequest(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey;

  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return null;
}

export function authorizeIngestRequest(request: Request): Response | null {
  const expectedSecret = getDealsSyncSecret();
  if (!expectedSecret) {
    return Response.json(
      { error: "DEALS_SYNC_SECRET (or LEADS_INGEST_SECRET) is not configured on the server" },
      { status: 503 },
    );
  }

  const providedSecret = getIngestSecretFromRequest(request);
  if (!providedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
