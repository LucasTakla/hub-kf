"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Moon, Search, Sun } from "lucide-react";

import { useTheme } from "@/components/hub/theme-provider";

type TopNavProps = {
  title: string;
  subtitle?: string;
};

export function TopNav({ title, subtitle }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between border-b px-4"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div>
          <h1 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="hidden items-center gap-2 rounded-md border px-2.5 py-1.5 md:flex"
          style={{
            background: "var(--bg-muted)",
            borderColor: "var(--border-default)",
          }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Search...
          </span>
          <kbd
            className="ml-6 rounded border px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--text-tertiary)",
              background: "var(--bg-surface)",
            }}
          >
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80"
          style={{ background: "var(--bg-muted)" }}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80"
          style={{ background: "var(--bg-muted)" }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          ) : (
            <Sun className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
