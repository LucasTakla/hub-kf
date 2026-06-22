"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreativeStatus, CreativeType, LeadNationality } from "@prisma/client";
import { Film, Image, RefreshCw, Search, Sparkles, Video } from "lucide-react";

import { CreativeUploadPanel } from "@/components/marketing/creatives/creative-upload-panel";
import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import { CreativeStatusBadge } from "@/components/marketing/shared/status-badges";
import { ModuleHeader, PanelSection } from "@/components/marketing/shared/panel-section";
import { LeadNationalityBadge } from "@/components/sales/shared/badges";
import {
  CREATIVE_STATUSES,
  CREATIVE_TYPE_LABELS,
  CREATIVE_TYPES,
  type CreativeRecord,
} from "@/lib/creatives/types";
import { isVideoMimeType } from "@/lib/creatives/media";
import { LEAD_NATIONALITIES } from "@/lib/leads/nationality";

type CreativesTab = "library" | "performance" | "ai-studio" | "testing";

const tabs: { id: CreativesTab; label: string; description?: string; disabled?: boolean }[] = [
  { id: "library", label: "Library", description: "All assets" },
  { id: "performance", label: "Performance", description: "Rankings", disabled: true },
  { id: "ai-studio", label: "AI Studio", description: "Briefs", disabled: true },
  { id: "testing", label: "Testing", description: "Experiments", disabled: true },
];

type CreativesWorkspaceProps = {
  initialCreatives: CreativeRecord[];
  initialTotal: number;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TypeIcon({ mimeType }: { mimeType: string }) {
  const Icon = mimeType.startsWith("video/") ? Video : Image;
  return <Icon className="h-8 w-8" style={{ color: "var(--accent)" }} strokeWidth={1.5} />;
}

export function CreativesWorkspace({ initialCreatives, initialTotal }: CreativesWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<CreativesTab>("library");
  const [creatives, setCreatives] = useState(initialCreatives);
  const [total, setTotal] = useState(initialTotal);
  const [selected, setSelected] = useState<CreativeRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CreativeStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CreativeType | "all">("all");
  const [nationalityFilter, setNationalityFilter] = useState<LeadNationality | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadCreatives = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (nationalityFilter !== "all") params.set("nationality", nationalityFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/creatives?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load creatives");
      const data = (await response.json()) as { items: CreativeRecord[]; total: number };
      setCreatives(data.items);
      setTotal(data.total);
      setSelected((current) =>
        current ? data.items.find((item) => item.id === current.id) ?? null : null,
      );
    } finally {
      setRefreshing(false);
    }
  }, [nationalityFilter, search, statusFilter, typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadCreatives();
    }, 250);
    return () => clearTimeout(timeout);
  }, [loadCreatives]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ModuleHeader
          title="Produce"
          purpose="Creative library hosted on Hostinger — upload, preview, and organize ad assets"
        />
        <ModuleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "library" ? (
          <>
            <div
              className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="relative min-w-[200px] flex-1">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, Meta ad, tags..."
                  className="w-full rounded-md border py-1.5 pl-8 pr-2.5 text-[12px] outline-none"
                  style={{
                    background: "var(--bg-muted)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as CreativeStatus | "all")}
                className="rounded-md border px-2 py-1.5 text-[12px]"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
              >
                <option value="all">All statuses</option>
                {CREATIVE_STATUSES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as CreativeType | "all")}
                className="rounded-md border px-2 py-1.5 text-[12px]"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
              >
                <option value="all">All types</option>
                {CREATIVE_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>

              <select
                value={nationalityFilter}
                onChange={(event) => setNationalityFilter(event.target.value as LeadNationality | "all")}
                className="rounded-md border px-2 py-1.5 text-[12px]"
                style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
              >
                <option value="all">All markets</option>
                {LEAD_NATIONALITIES.map((item) => (
                  <option key={item.id} value={item.id}>{item.id}</option>
                ))}
              </select>

              <CreativeUploadPanel onComplete={loadCreatives} />

              <button
                type="button"
                onClick={() => void loadCreatives()}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px]"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
              <PanelSection
                title="Asset library"
                description={`${total} creative${total === 1 ? "" : "s"} stored on Hostinger`}
              >
                {creatives.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {creatives.map((creative) => (
                      <article
                        key={creative.id}
                        onClick={() => setSelected(creative)}
                        className="cursor-pointer overflow-hidden rounded-lg border transition-colors hover:opacity-95"
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: selected?.id === creative.id ? "var(--accent)" : "var(--border-default)",
                        }}
                      >
                        <div
                          className="relative flex aspect-video items-center justify-center overflow-hidden"
                          style={{ background: "var(--bg-muted)" }}
                        >
                          {isVideoMimeType(creative.mimeType) ? (
                            <video
                              src={creative.assetUrl}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                              onMouseEnter={(event) => void event.currentTarget.play().catch(() => undefined)}
                              onMouseLeave={(event) => {
                                event.currentTarget.pause();
                                event.currentTarget.currentTime = 0;
                              }}
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={creative.assetUrl}
                              alt={creative.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                              {creative.name}
                            </h4>
                            <CreativeStatusBadge status={creative.status} />
                          </div>
                          <p className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {CREATIVE_TYPE_LABELS[creative.type]} · {formatFileSize(creative.fileSize)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {creative.nationality ? (
                              <LeadNationalityBadge nationality={creative.nationality} />
                            ) : null}
                            {creative.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded px-1.5 py-0.5 text-[10px]"
                                style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Film className="h-10 w-10" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
                    <p className="mt-3 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                      No creatives yet
                    </p>
                    <p className="mt-1 max-w-sm text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      Upload MP4, WebM, MOV, or images. Files are stored on Hostinger and playable in the Hub.
                    </p>
                  </div>
                )}
              </PanelSection>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <Sparkles className="h-10 w-10" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
            <p className="mt-3 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              Coming soon
            </p>
            <p className="mt-1 max-w-md text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              Performance rankings and Higgsfield brief export are next. The library is live with Hostinger video storage.
            </p>
          </div>
        )}
      </div>

      {selected ? (
        <aside
          className="flex w-[360px] shrink-0 flex-col border-l"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <div className="border-b p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {selected.name}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {CREATIVE_TYPE_LABELS[selected.type]} · {formatFileSize(selected.fileSize)}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
            <div
              className="mb-4 overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
            >
              {isVideoMimeType(selected.mimeType) ? (
                <video
                  src={selected.assetUrl}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.assetUrl} alt={selected.name} className="w-full object-contain" />
              )}
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="flex items-center gap-2">
                <CreativeStatusBadge status={selected.status} />
                {selected.nationality ? (
                  <LeadNationalityBadge nationality={selected.nationality} />
                ) : null}
              </div>

              {selected.metaAdName ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Meta ad name
                  </p>
                  <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{selected.metaAdName}</p>
                </div>
              ) : null}

              {selected.script ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Script / brief
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {selected.script}
                  </p>
                </div>
              ) : null}

              {selected.notes ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Notes
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {selected.notes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
