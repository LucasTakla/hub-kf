"use client";

import { useState } from "react";

import { ModuleHeader } from "@/components/marketing/shared/panel-section";
import { TeamMemberPanel } from "@/components/operations/team/team-member-panel";
import { teamMembers } from "@/lib/operations/mock-data";
import type { TeamMember } from "@/lib/operations/types";

export function TeamWorkspace() {
  const [selected, setSelected] = useState<TeamMember | null>(teamMembers[0]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Who is responsible?"
        purpose="Operational visibility into workload, ownership, and activity — not HR"
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-default)" }}>
              <table className="w-full text-left text-[12px]">
                <thead style={{ background: "var(--bg-muted)" }}>
                  <tr style={{ color: "var(--text-tertiary)" }}>
                    <th className="px-4 py-2.5 font-medium">Team Member</th>
                    <th className="px-4 py-2.5 font-medium">Role</th>
                    <th className="px-4 py-2.5 text-right font-medium">Deals</th>
                    <th className="px-4 py-2.5 text-right font-medium">Applications</th>
                    <th className="px-4 py-2.5 text-right font-medium">Offers</th>
                    <th className="px-4 py-2.5 text-right font-medium">Roadmap</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr
                      key={member.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(member)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(member);
                        }
                      }}
                      className="cursor-pointer border-t transition-colors hover:opacity-90"
                      style={{
                        borderColor: "var(--border-subtle)",
                        background: selected?.id === member.id ? "var(--accent-subtle)" : "var(--bg-surface)",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ background: "var(--accent)" }}
                          >
                            {member.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {member.role}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                        {member.dealsOwned}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {member.applicationsManaged}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {member.offersManaged}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {member.openRoadmapTasks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Click a team member for detailed workload and assignments · Roadmap tasks link to /roadmap
            </p>
          </div>
        </div>

        {selected ? (
          <TeamMemberPanel member={selected} onClose={() => setSelected(null)} />
        ) : null}
      </div>
    </div>
  );
}
