"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ModuleHeader } from "@/components/marketing/shared/panel-section";
import { ModuleBadge } from "@/components/operations/shared/badges";
import { OwnerAvatar } from "@/components/sales/shared/badges";
import { ACTIVITY_MODULES, MODULE_COLORS } from "@/lib/operations/constants";
import { activityEvents } from "@/lib/operations/mock-data";
import type { ActivityEvent, ActivityModule } from "@/lib/operations/types";

type DateFilter = "today" | "7d" | "30d" | "all";

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function isWithinDateFilter(timestamp: string, filter: DateFilter) {
  if (filter === "all") return true;
  const date = new Date(timestamp);
  const now = new Date();
  if (filter === "today") return date.toDateString() === now.toDateString();
  const days = filter === "7d" ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff;
}

export function ActivityWorkspace() {
  const [moduleFilter, setModuleFilter] = useState<ActivityModule | "all">("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ActivityEvent | null>(null);

  const users = useMemo(
    () => ["all", ...new Set(activityEvents.map((e) => e.user))],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activityEvents
      .filter((event) => {
        const matchesModule = moduleFilter === "all" || event.module === moduleFilter;
        const matchesUser = userFilter === "all" || event.user === userFilter;
        const matchesDate = isWithinDateFilter(event.timestamp, dateFilter);
        const matchesSearch =
          !q ||
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.user.toLowerCase().includes(q) ||
          event.entityName?.toLowerCase().includes(q);
        return matchesModule && matchesUser && matchesDate && matchesSearch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [moduleFilter, userFilter, dateFilter, search]);

  const todayCount = activityEvents.filter((e) => isWithinDateFilter(e.timestamp, "today")).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="What is happening?"
        purpose="Company-wide activity feed — what happened, what's happening, what changed"
      />

      <div
        className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          {todayCount} events today
        </span>
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>·</span>
        <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {filtered.length} shown
        </span>
      </div>

      <div
        className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2"
        style={{ background: "var(--bg-muted)", borderColor: "var(--border-default)" }}
      >
        <div className="flex flex-wrap gap-1">
          {ACTIVITY_MODULES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setModuleFilter(id)}
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{
                background: moduleFilter === id ? "var(--accent-subtle)" : "var(--bg-surface)",
                color: moduleFilter === id ? "var(--accent)" : "var(--text-tertiary)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-md border px-2 py-1 text-[11px] outline-none"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
          }}
        >
          {users.map((u) => (
            <option key={u} value={u}>
              {u === "all" ? "All users" : u}
            </option>
          ))}
        </select>

        {(["today", "7d", "30d", "all"] as DateFilter[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDateFilter(d)}
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{
              background: dateFilter === d ? "var(--accent-subtle)" : "var(--bg-surface)",
              color: dateFilter === d ? "var(--accent)" : "var(--text-tertiary)",
            }}
          >
            {d === "today" ? "Today" : d === "7d" ? "7 Days" : d === "30d" ? "30 Days" : "All"}
          </button>
        ))}

        <div
          className="ml-auto flex items-center gap-2 rounded-md border px-2.5 py-1.5"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)" }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity..."
            className="w-44 bg-transparent text-[12px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
          <div className="mx-auto max-w-3xl space-y-0">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No activity matches your filters
              </p>
            ) : (
              filtered.map((event, i) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelected(event)}
                  className="flex w-full gap-3 rounded-md px-2 py-3 text-left transition-colors hover:opacity-90"
                  style={{
                    background: selected?.id === event.id ? "var(--accent-subtle)" : undefined,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: MODULE_COLORS[event.module] }}
                    />
                    {i < filtered.length - 1 ? (
                      <div
                        className="mt-1 w-px flex-1 min-h-[24px]"
                        style={{ background: "var(--border-default)" }}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ModuleBadge module={event.module} />
                      <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {event.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <OwnerAvatar name={event.user} />
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {event.user}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {selected ? (
          <aside
            className="w-[320px] shrink-0 overflow-y-auto border-l p-4 enterprise-scroll"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Activity Details
            </p>
            <h3 className="mt-2 text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              {selected.title}
            </h3>
            <div className="mt-2">
              <ModuleBadge module={selected.module} />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {selected.description}
            </p>
            <dl className="mt-4 space-y-2 text-[12px]">
              <div>
                <dt style={{ color: "var(--text-tertiary)" }}>User</dt>
                <dd className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.user}</dd>
              </div>
              <div>
                <dt style={{ color: "var(--text-tertiary)" }}>Time</dt>
                <dd style={{ color: "var(--text-primary)" }}>
                  {new Date(selected.timestamp).toLocaleString()}
                </dd>
              </div>
              {selected.entityType ? (
                <div>
                  <dt style={{ color: "var(--text-tertiary)" }}>Entity</dt>
                  <dd style={{ color: "var(--text-primary)" }}>
                    {selected.entityType}
                    {selected.entityName ? ` — ${selected.entityName}` : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
