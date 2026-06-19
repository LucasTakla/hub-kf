"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  connectMetaManual,
  disconnectMeta,
  fetchMetaStatus,
} from "@/lib/marketing/api";
import type { MetaConnectionStatus } from "@/lib/meta/types";

const inputClass =
  "w-full rounded-md border px-2.5 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function MetaConnectPanel() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<MetaConnectionStatus | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMetaStatus().then(setStatus);
  }, []);

  useEffect(() => {
    const metaParam = searchParams.get("meta");
    if (metaParam === "connected") setMessage("Meta account connected successfully.");
    if (metaParam === "error") setError("Meta OAuth failed. Try manual token setup.");
    if (metaParam === "no-account") setError("No Meta ad accounts found on this Facebook user.");
  }, [searchParams]);

  async function handleManualConnect(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await connectMetaManual({ accessToken, adAccountId });
    if (!result.ok) {
      setError(result.error ?? "Connection failed");
    } else {
      setMessage(`Connected — synced ${result.campaigns ?? 0} campaigns from Meta.`);
      setAccessToken("");
      setStatus(await fetchMetaStatus());
    }
    setSaving(false);
  }

  async function handleDisconnect() {
    setSaving(true);
    await disconnectMeta();
    setStatus(await fetchMetaStatus());
    setMessage("Meta disconnected.");
    setSaving(false);
  }

  return (
    <section
      className="rounded-lg border"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border-subtle)" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Meta Ads
        </h3>
        <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
          Connect Facebook to pull live spend, clicks, impressions, and lead metrics into Marketing.
        </p>
      </div>

      <div className="space-y-4 p-4">
        {message ? (
          <p className="rounded-md px-3 py-2 text-[12px]" style={{ background: "var(--success-subtle)", color: "var(--success)" }}>
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md px-3 py-2 text-[12px]" style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}>
            {error}
          </p>
        ) : null}

        <div className="rounded-md border px-3 py-2.5 text-[12px]" style={{ borderColor: "var(--border-subtle)" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            Status:{" "}
            <span style={{ color: status?.connected ? "var(--success)" : "var(--text-tertiary)" }}>
              {status?.connected ? "Connected" : "Not connected"}
            </span>
          </p>
          {status?.connected ? (
            <>
              <p className="mt-1" style={{ color: "var(--text-tertiary)" }}>
                Ad account: act_{status.adAccountId}
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                Source: {status.source}
                {status.lastSyncAt ? ` · Last sync ${new Date(status.lastSyncAt).toLocaleString()}` : ""}
              </p>
            </>
          ) : null}
        </div>

        {status?.oauthAvailable ? (
          <a
            href="/api/marketing/meta/oauth/start"
            className="inline-flex rounded-md px-3 py-2 text-[12px] font-medium text-white"
            style={{ background: "#1877F2" }}
          >
            Connect with Facebook
          </a>
        ) : null}

        <form onSubmit={(event) => void handleManualConnect(event)} className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Manual connection
          </p>
          <div>
            <label className="mb-1 block text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Access token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              placeholder="Meta system user or long-lived token"
              className={inputClass}
              style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Ad account ID
            </label>
            <input
              value={adAccountId}
              onChange={(event) => setAdAccountId(event.target.value)}
              placeholder="1234567890"
              className={inputClass}
              style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-60"
              style={{ background: "var(--accent)" }}
            >
              {saving ? "Connecting..." : "Save connection"}
            </button>
            {status?.connected ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDisconnect()}
                className="rounded-md border px-3 py-1.5 text-[12px] font-medium"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Disconnect
              </button>
            ) : null}
          </div>
        </form>

        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Hub leads from n8n are merged with Meta campaign names in{" "}
          <Link href="/sales/leads" className="underline" style={{ color: "var(--accent)" }}>
            Sales → Leads
          </Link>{" "}
          and{" "}
          <Link href="/marketing/campaigns" className="underline" style={{ color: "var(--accent)" }}>
            Marketing → Campaigns
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
