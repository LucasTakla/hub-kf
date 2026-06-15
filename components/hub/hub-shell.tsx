"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Sidebar } from "@/components/hub/sidebar";
import { TopNav } from "@/components/hub/top-nav";
import { getPageMeta } from "@/lib/navigation";

type HubShellProps = {
  children: React.ReactNode;
  canAccessExecutive: boolean;
};

export function HubShell({ children, canAccessExecutive }: HubShellProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  useEffect(() => {
    void fetch("/api/hub/session", { method: "POST" });
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-app)" }}
    >
      <Sidebar canAccessExecutive={canAccessExecutive} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
