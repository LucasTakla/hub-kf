import { Suspense } from "react";

import { MetaConnectPanel } from "@/components/settings/meta-connect-panel";

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-4 enterprise-scroll">
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-[18px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Integrations and platform configuration
          </p>
        </div>

        <Suspense fallback={null}>
          <MetaConnectPanel />
        </Suspense>
      </div>
    </div>
  );
}
