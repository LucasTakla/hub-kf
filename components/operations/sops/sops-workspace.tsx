"use client";

import { useMemo, useState } from "react";
import { Bot, Clock, FileText, History, Plus, Search, Send, Tag } from "lucide-react";

import { ModuleHeader, PanelSection } from "@/components/marketing/shared/panel-section";
import { SOP_CATEGORIES } from "@/lib/operations/constants";
import { sopAiSampleAnswer, sopDocuments } from "@/lib/operations/mock-data";
import type { SopCategory, SopDocument } from "@/lib/operations/types";

function matchesNaturalSearch(sop: SopDocument, query: string) {
  const q = query.toLowerCase();
  const phrases: Record<string, string[]> = {
    submit: ["submit", "application", "lender"],
    present: ["present", "offer", "client"],
    onboard: ["onboard", "lender", "partner"],
    qualify: ["qualify", "deal", "intake"],
    campaign: ["campaign", "launch", "meta", "ads"],
    automation: ["automation", "workflow", "agent"],
    compliance: ["compliance", "legal", "regulatory"],
  };

  const text = `${sop.title} ${sop.summary} ${sop.tags.join(" ")} ${sop.content}`.toLowerCase();
  if (text.includes(q)) return true;

  for (const keywords of Object.values(phrases)) {
    if (keywords.some((k) => q.includes(k)) && keywords.some((k) => text.includes(k))) {
      return true;
    }
  }
  return false;
}

export function SopsWorkspace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SopCategory | "all">("all");
  const [selected, setSelected] = useState<SopDocument | null>(sopDocuments[0]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim();
    return sopDocuments.filter((sop) => {
      const matchesCategory = category === "all" || sop.category === category;
      const matchesSearch = !q || matchesNaturalSearch(sop, q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleAiAsk = () => {
    if (!aiQuestion.trim()) return;
    setAiAnswer(sopAiSampleAnswer);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="How do we do it?"
        purpose="Company operating manual — searchable processes and internal knowledge"
      />

      <div
        className="shrink-0 border-b px-4 py-3"
        style={{ background: "var(--accent-subtle)", borderColor: "var(--border-default)" }}
      >
        <div className="flex gap-0.5 rounded-lg border p-0.5" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
          <Search className="ml-2.5 h-4 w-4 shrink-0 self-center" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search SOPs — e.g. "How do I submit an application?"'
            className="flex-1 bg-transparent py-2.5 pr-3 text-[13px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          className="flex w-[300px] shrink-0 flex-col border-r"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div
            className="flex shrink-0 flex-wrap gap-1 border-b p-2"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {SOP_CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className="rounded px-2 py-1 text-[10px] font-medium"
                style={{
                  background: category === id ? "var(--accent-subtle)" : "var(--bg-muted)",
                  color: category === id ? "var(--accent)" : "var(--text-tertiary)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between px-3 py-2">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {filtered.length} SOPs
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] font-medium"
              style={{ color: "var(--accent)" }}
            >
              <Plus className="h-3 w-3" />
              Create SOP
            </button>
          </div>

          <div className="flex-1 overflow-y-auto enterprise-scroll">
            {filtered.map((sop) => (
              <button
                key={sop.id}
                type="button"
                onClick={() => {
                  setSelected(sop);
                  setShowVersions(false);
                }}
                className="w-full border-b px-3 py-3 text-left transition-colors"
                style={{
                  borderColor: "var(--border-subtle)",
                  background: selected?.id === sop.id ? "var(--accent-subtle)" : "var(--bg-surface)",
                }}
              >
                <p className="text-[12px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                  {sop.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {sop.summary}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {sop.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-1 py-0.5 text-[9px]"
                      style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {selected ? (
            <>
              <div
                className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}
              >
                <div>
                  <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    {selected.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span className="capitalize">{selected.category}</span>
                    <span>·</span>
                    <span>v{selected.version}</span>
                    <span>·</span>
                    <span>Updated {selected.updatedAt} by {selected.updatedBy}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px]"
                        style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVersions(!showVersions)}
                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    <History className="h-3.5 w-3.5" />
                    History
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 enterprise-scroll">
                {showVersions ? (
                  <PanelSection title="Version History">
                    <div className="space-y-2">
                      {selected.versions.map((v) => (
                        <div
                          key={v.version}
                          className="flex items-start justify-between rounded-md border p-3"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <div>
                            <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                              Version {v.version}
                            </p>
                            <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                              {v.note}
                            </p>
                          </div>
                          <div className="text-right text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            <p>{v.updatedBy}</p>
                            <p className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />
                              {v.updatedAt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PanelSection>
                ) : (
                  <article
                    className="prose prose-sm max-w-none rounded-lg border p-4"
                    style={{
                      borderColor: "var(--border-default)",
                      background: "var(--bg-surface)",
                    }}
                  >
                    <pre
                      className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {selected.content}
                    </pre>
                  </article>
                )}

                <div className="mt-4">
                  <PanelSection
                    title="Ask AI About SOPs"
                    description="Get answers from internal documentation"
                    action={
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                      >
                        <Bot className="h-3 w-3" />
                        AI
                      </span>
                    }
                  >
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        "How do we process a deal after receiving an offer?",
                        "How do I submit an application?",
                        "How do I onboard a lender?",
                      ].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setAiQuestion(q)}
                          className="rounded-md border px-2 py-1 text-left text-[10px] transition-colors hover:opacity-80"
                          style={{
                            borderColor: "var(--border-default)",
                            color: "var(--text-secondary)",
                            background: "var(--bg-muted)",
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAiAsk()}
                        placeholder="Ask a question about company processes..."
                        className="flex-1 rounded-md border px-3 py-2 text-[12px] outline-none"
                        style={{
                          background: "var(--bg-muted)",
                          borderColor: "var(--border-default)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAiAsk}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-[12px] font-medium text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Ask
                      </button>
                    </div>
                    {aiAnswer ? (
                      <pre
                        className="mt-3 whitespace-pre-wrap rounded-md p-3 text-[12px] leading-relaxed"
                        style={{ background: "var(--bg-muted)", color: "var(--text-primary)" }}
                      >
                        {aiAnswer}
                      </pre>
                    ) : null}
                  </PanelSection>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
              <p className="mt-3 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                Select an SOP to view
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
