export default function HubLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className="shrink-0 border-b px-4 py-3"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <div
          className="h-3 w-24 animate-pulse rounded"
          style={{ background: "var(--bg-muted)" }}
        />
        <div
          className="mt-2 h-2.5 w-48 animate-pulse rounded"
          style={{ background: "var(--bg-muted)" }}
        />
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            />
          ))}
        </div>

        <div
          className="mt-4 h-[min(420px,60vh)] animate-pulse rounded-lg border"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        />
      </div>
    </div>
  );
}
