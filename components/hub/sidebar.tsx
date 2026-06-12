"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/hub/brand-logo";
import {
  getVisibleNavGroups,
  isNavItemActive,
  overviewNav,
  platformNav,
  type NavItem,
} from "@/lib/navigation";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
      style={{
        background: isActive ? "var(--bg-muted)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroupSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <p
        className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sidebar({ canAccessExecutive }: { canAccessExecutive: boolean }) {
  const pathname = usePathname();
  const visibleNavGroups = getVisibleNavGroups(canAccessExecutive);

  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col border-r"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="px-3 py-3">
        <Link href="/overview">
          <BrandLogo variant="primary" className="h-8 w-auto max-w-[180px] dark:hidden" />
          <BrandLogo variant="white" className="hidden h-8 w-auto max-w-[180px] dark:block" />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2 enterprise-scroll">
        <ul className="mb-4 space-y-0.5">
          <li>
            <NavLink item={overviewNav} pathname={pathname} />
          </li>
        </ul>

        <div className="space-y-4">
          {visibleNavGroups.map((group) => (
            <NavGroupSection
              key={group.id}
              label={group.label}
              items={group.items}
              pathname={pathname}
            />
          ))}
        </div>

        <div className="mt-auto space-y-0.5 border-t pt-3" style={{ borderColor: "var(--border-default)" }}>
          {platformNav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
