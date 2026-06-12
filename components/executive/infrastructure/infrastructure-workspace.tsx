"use client";

import { useMemo, useState } from "react";

import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import { ModuleHeader, PanelSection, formatCurrency } from "@/components/marketing/shared/panel-section";
import { INFRASTRUCTURE_TABS } from "@/lib/executive/constants";
import {
  apiKeys,
  domains,
  integrations,
  platforms,
  servers,
} from "@/lib/executive/mock-data";
import type { InfrastructureTab } from "@/lib/executive/types";

function statusColor(status: string) {
  switch (status) {
    case "healthy":
    case "connected":
    case "online":
      return "var(--success)";
    case "degraded":
    case "error":
      return "var(--warning, #d97706)";
    case "outage":
    case "offline":
    case "disconnected":
      return "var(--danger)";
    default:
      return "var(--text-tertiary)";
  }
}

function PlatformsTab() {
  const totalCost = platforms.reduce((sum, p) => sum + p.monthlyCost, 0);
  return (
    <PanelSection
      title="Platforms"
      description="SaaS and vendor stack — costs, ownership, renewals, and health"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 font-medium">Platform</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Owner</th>
              <th className="pb-2 font-medium text-right">Monthly</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Renewal</th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => (
              <tr key={platform.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="py-2">
                  <p style={{ color: "var(--text-primary)" }}>{platform.name}</p>
                  {platform.notes ? (
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{platform.notes}</p>
                  ) : null}
                </td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{platform.category}</td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{platform.owner}</td>
                <td className="py-2 text-right tabular-nums">
                  {platform.monthlyCost ? formatCurrency(platform.monthlyCost) : "—"}
                </td>
                <td className="py-2 capitalize" style={{ color: statusColor(platform.status) }}>
                  {platform.status}
                </td>
                <td className="py-2" style={{ color: "var(--text-tertiary)" }}>
                  {platform.renewalDate ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
        Platform spend (excl. ad media): {formatCurrency(totalCost)}/mo
      </p>
    </PanelSection>
  );
}

function IntegrationsTab() {
  return (
    <PanelSection title="Integrations" description="System connections, sync health, and ownership">
      <ul className="space-y-2">
        {integrations.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div>
              <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {item.platform} · Owner: {item.owner}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] capitalize" style={{ color: statusColor(item.status) }}>
                {item.status}
              </p>
              {item.lastSync ? (
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  Last sync: {new Date(item.lastSync).toLocaleString()}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}

function DomainsTab() {
  return (
    <PanelSection title="Domains" description="DNS assets, registrars, and renewal schedule">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 font-medium">Domain</th>
              <th className="pb-2 font-medium">Registrar</th>
              <th className="pb-2 font-medium">Expires</th>
              <th className="pb-2 font-medium">Auto-renew</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr key={domain.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="py-2" style={{ color: "var(--text-primary)" }}>{domain.domain}</td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{domain.registrar}</td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{domain.expiresAt}</td>
                <td className="py-2" style={{ color: domain.autoRenew ? "var(--success)" : "var(--text-tertiary)" }}>
                  {domain.autoRenew ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelSection>
  );
}

function ServersTab() {
  const totalCost = servers.reduce((sum, s) => sum + s.monthlyCost, 0);
  return (
    <PanelSection title="Servers" description="Compute infrastructure and operational status">
      <ul className="space-y-2">
        {servers.map((server) => (
          <li
            key={server.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2.5"
            style={{ background: "var(--bg-muted)" }}
          >
            <div>
              <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{server.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {server.provider} · {server.region}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] capitalize" style={{ color: statusColor(server.status) }}>
                {server.status}
              </p>
              <p className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                {formatCurrency(server.monthlyCost)}/mo
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
        Infrastructure compute: {formatCurrency(totalCost)}/mo
      </p>
    </PanelSection>
  );
}

function ApiKeysTab() {
  return (
    <PanelSection title="API keys" description="Credential ownership, rotation, and scope">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="pb-2 font-medium">Service</th>
              <th className="pb-2 font-medium">Owner</th>
              <th className="pb-2 font-medium">Scope</th>
              <th className="pb-2 font-medium">Last rotated</th>
              <th className="pb-2 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="py-2" style={{ color: "var(--text-primary)" }}>{key.service}</td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{key.owner}</td>
                <td className="py-2" style={{ color: "var(--text-secondary)" }}>{key.scope}</td>
                <td className="py-2" style={{ color: "var(--text-tertiary)" }}>{key.lastRotated ?? "—"}</td>
                <td className="py-2" style={{ color: key.expiresAt ? "var(--warning, #d97706)" : "var(--text-tertiary)" }}>
                  {key.expiresAt ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelSection>
  );
}

const tabPanels: Record<InfrastructureTab, React.ComponentType> = {
  platforms: PlatformsTab,
  integrations: IntegrationsTab,
  domains: DomainsTab,
  servers: ServersTab,
  "api-keys": ApiKeysTab,
};

export function InfrastructureWorkspace() {
  const [activeTab, setActiveTab] = useState<InfrastructureTab>("platforms");
  const Panel = tabPanels[activeTab];

  const degradedCount = useMemo(
    () =>
      platforms.filter((p) => p.status !== "healthy").length +
      integrations.filter((i) => i.status !== "connected").length +
      servers.filter((s) => s.status !== "online").length,
    [],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Infrastructure"
        purpose="Platform costs, ownership, system health, renewals, and dependencies"
      />
      <ModuleTabs tabs={INFRASTRUCTURE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      {degradedCount > 0 ? (
        <div
          className="shrink-0 border-b px-4 py-1.5 text-right text-[11px] font-medium"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-default)", color: "var(--warning, #d97706)" }}
        >
          {degradedCount} item{degradedCount === 1 ? "" : "s"} need attention
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
        <Panel />
      </div>
    </div>
  );
}
