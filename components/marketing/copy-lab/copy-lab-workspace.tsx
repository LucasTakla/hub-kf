"use client";

import { useState } from "react";
import {
  Bot,
  Clock,
  Code,
  Copy,
  Eye,
  FileText,
  Layout,
  Mail,
  MessageCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { ModuleTabs } from "@/components/marketing/shared/module-tabs";
import { ModuleHeader, PanelSection } from "@/components/marketing/shared/panel-section";
import { copyTemplates } from "@/lib/marketing/mock-data";
import type { CopyChannel } from "@/lib/marketing/types";

type CopyTab = CopyChannel;
type SubTab = "templates" | "generator" | "history" | "performance";

const channelTabs: { id: CopyTab; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "meta-ads", label: "Meta Ads", icon: FileText },
  { id: "landing-pages", label: "Landing Pages", icon: Layout },
];

const subTabs: { id: SubTab; label: string }[] = [
  { id: "templates", label: "Templates" },
  { id: "generator", label: "Generator" },
  { id: "history", label: "History" },
  { id: "performance", label: "Performance" },
];

const objectives = [
  "Drive application submissions",
  "Re-engage cold leads",
  "Convert MQLs to applications",
  "Promote same-day funding",
  "Nurture submitted applications",
];

const audiences = ["Restaurant owners", "Retail merchants", "Spanish-speaking SMBs", "High-intent retargeting"];
const languages = ["English", "Spanish", "Bilingual"];
const tones = ["Professional", "Conversational", "Urgent", "Empathetic", "Direct"];

const sampleEmailHtml = `<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #0c5ded;">Your funding application is almost complete</h1>
  <p>Hi {{first_name}},</p>
  <p>We noticed you started an application but haven't submitted yet.
  Most businesses get approved within 24 hours.</p>
  <a href="{{apply_link}}" style="background: #0c5ded; color: white;
  padding: 12px 24px; text-decoration: none; border-radius: 6px;
  display: inline-block;">Complete Application</a>
</body>
</html>`;

export function CopyLabWorkspace() {
  const [channel, setChannel] = useState<CopyTab>("email");
  const [subTab, setSubTab] = useState<SubTab>("generator");
  const [objective, setObjective] = useState(objectives[0]);
  const [audience, setAudience] = useState(audiences[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [tone, setTone] = useState(tones[1]);
  const [generated, setGenerated] = useState<string | null>(null);
  const [showHtml, setShowHtml] = useState(false);

  const channelTemplates = copyTemplates.filter((t) => t.channel === channel);

  const handleGenerate = () => {
    if (channel === "email") {
      setGenerated(
        `Subject: {{first_name}}, your $50K funding is ready to review\n\nHi {{first_name}},\n\nRunning a ${audience.toLowerCase()} business means cash flow never stops — and neither do your opportunities.\n\nYour pre-qualification shows you may be eligible for up to $50,000 in working capital, with same-day approval available.\n\n→ Complete your application (2 min): {{apply_link}}\n\nQuestions? Reply to this email or call us at {{phone}}.\n\n— The Kapital Funding Team`,
      );
    } else if (channel === "sms") {
      setGenerated(
        `Hi {{first_name}} — your Kapital Funding application is 80% done. Most businesses get approved same-day. Finish here: {{short_link}} Reply STOP to opt out.`,
      );
    } else if (channel === "meta-ads") {
      setGenerated(
        `Primary Text:\nCash flow tight? Get up to $250K in working capital — approved in hours, not weeks.\n\nHeadline: Same-Day Business Funding\n\nDescription: Apply in 2 minutes. No hard credit pull.`,
      );
    } else {
      setGenerated(
        `[${channel.replace("-", " ")} copy generated for: ${objective}]\n\nAudience: ${audience}\nLanguage: ${language}\nTone: ${tone}\n\nContent will be tailored to channel format and best practices.`,
      );
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ModuleHeader
        title="Communicate"
        purpose="Messaging and copywriting workspace — what message should we send and how?"
      />
      <ModuleTabs
        tabs={channelTabs.map(({ id, label }) => ({ id, label }))}
        activeTab={channel}
        onTabChange={setChannel}
      />

      <div
        className="flex shrink-0 gap-1 border-b px-4 py-1.5"
        style={{
          background: "var(--bg-muted)",
          borderColor: "var(--border-default)",
        }}
      >
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className="rounded px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{
              background: subTab === id ? "var(--bg-surface)" : "transparent",
              color: subTab === id ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto enterprise-scroll">
        <div className="p-4">
          {subTab === "templates" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {channelTemplates.length > 0 ? (
                channelTemplates.map((template) => (
                  <article
                    key={template.id}
                    className="rounded-lg border p-4"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                    }}
                  >
                    <h4 className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {template.name}
                    </h4>
                    <p className="mt-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {template.objective}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.lastUsed}
                      </span>
                      {template.performance ? (
                        <span style={{ color: "var(--success)" }}>{template.performance}</span>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <p className="col-span-2 text-center text-[12px] py-12" style={{ color: "var(--text-tertiary)" }}>
                  No templates yet for this channel
                </p>
              )}
            </div>
          )}

          {subTab === "generator" && (
            <div className="grid gap-4 xl:grid-cols-2">
              <PanelSection title="Generation Flow" description="Objective → Audience → Language → Tone → Generate">
                <div className="space-y-3">
                  {[
                    { label: "Objective", value: objective, options: objectives, set: setObjective },
                    { label: "Audience", value: audience, options: audiences, set: setAudience },
                    { label: "Language", value: language, options: languages, set: setLanguage },
                    { label: "Tone", value: tone, options: tones, set: setTone },
                  ].map(({ label, value, options, set }) => (
                    <div key={label}>
                      <label className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-[12px] outline-none"
                        style={{
                          background: "var(--bg-muted)",
                          borderColor: "var(--border-default)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[12px] font-medium text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Copy
                  </button>
                </div>
              </PanelSection>

              <PanelSection
                title="Generated Copy"
                description={channel === "email" ? "Preview, edit, and export HTML" : "Review and copy output"}
                action={
                  generated ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[10px] font-medium"
                      style={{ color: "var(--accent)" }}
                      onClick={() => navigator.clipboard.writeText(generated)}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  ) : null
                }
              >
                {generated ? (
                  <div className="space-y-3">
                    {channel === "email" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowHtml(false)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium"
                          style={{
                            background: !showHtml ? "var(--accent-subtle)" : "var(--bg-muted)",
                            color: !showHtml ? "var(--accent)" : "var(--text-tertiary)",
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowHtml(true)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium"
                          style={{
                            background: showHtml ? "var(--accent-subtle)" : "var(--bg-muted)",
                            color: showHtml ? "var(--accent)" : "var(--text-tertiary)",
                          }}
                        >
                          <Code className="h-3 w-3" />
                          HTML
                        </button>
                      </div>
                    )}
                    <pre
                      className="whitespace-pre-wrap rounded-md p-3 text-[12px] leading-relaxed"
                      style={{
                        background: "var(--bg-muted)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {channel === "email" && showHtml ? sampleEmailHtml : generated}
                    </pre>
                    {channel === "email" && (
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        Future: Export to Instantly, SendGrid, Amazon SES
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <Bot className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />
                    <p className="mt-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      Configure options and generate copy
                    </p>
                  </div>
                )}
              </PanelSection>
            </div>
          )}

          {subTab === "history" && (
            <PanelSection title="Generation History" description="Recent copy generations across this channel">
              <div className="space-y-2">
                {[
                  { date: "2026-06-10", preview: "Subject: Your $50K funding is ready...", type: "Email sequence" },
                  { date: "2026-06-08", preview: "Hi {{first_name}} — your application is 80% done...", type: "Follow-up" },
                  { date: "2026-06-05", preview: "Cash flow tight? Get up to $250K...", type: "Promotional" },
                ].map((item) => (
                  <div
                    key={item.date + item.type}
                    className="rounded-md border px-3 py-2.5"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {item.type}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{item.date}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {item.preview}
                    </p>
                  </div>
                ))}
              </div>
            </PanelSection>
          )}

          {subTab === "performance" && (
            <PanelSection title="Copy Performance" description="How messaging converts to business outcomes">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Open Rate", value: "32.4%" },
                  { label: "Click Rate", value: "8.1%" },
                  { label: "Reply Rate", value: "4.2%" },
                  { label: "App Conversion", value: "12.8%" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-md p-3 text-center"
                    style={{ background: "var(--bg-muted)" }}
                  >
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      {m.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Connect email/SMS providers for live performance data
              </p>
            </PanelSection>
          )}
        </div>
      </div>
    </div>
  );
}
