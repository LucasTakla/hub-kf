"use client";

type ModuleTabsProps<T extends string> = {
  tabs: { id: T; label: string; description?: string; disabled?: boolean }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
};

export function ModuleTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: ModuleTabsProps<T>) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-4"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {tabs.map(({ id, label, description, disabled }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onTabChange(id)}
            className="relative shrink-0 px-3 py-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: active ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <span>{label}</span>
            {description ? (
              <span
                className="ml-1.5 hidden text-[10px] font-normal sm:inline"
                style={{ color: "var(--text-tertiary)" }}
              >
                {description}
              </span>
            ) : null}
            {active ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5"
                style={{ background: "var(--accent)" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
