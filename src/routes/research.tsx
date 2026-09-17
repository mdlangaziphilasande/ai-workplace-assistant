import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Field, SegmentedControl, ToolWorkspace, errorMessage, inputClass } from "@/components/ToolWorkspace";
import { researchSummary } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | Workplace AI" },
      { name: "description", content: "Summarize topics, articles, and web pages into insights, recommendations, and actionable takeaways." },
      { property: "og:title", content: "AI Research Assistant | Workplace AI" },
      { property: "og:description", content: "Summarize topics, articles, and web pages into insights, recommendations, and actionable takeaways." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const MODES = ["Topic", "Article", "URL"] as const;
type Mode = (typeof MODES)[number];

const PLACEHOLDERS: Record<Mode, string> = {
  Topic: "e.g. Best practices for running asynchronous stand-ups in distributed teams",
  Article: "Paste the full text of an article, report, or memo…",
  URL: "https://example.com/article",
};

function ResearchPage() {
  const run = useServerFn(researchSummary);
  const [mode, setMode] = useState<Mode>("Topic");
  const [content, setContent] = useState("");
  const [focus, setFocus] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = mode === "URL" ? /^https?:\/\/\S+\.\S+/.test(content.trim()) : content.trim().length >= 3;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { mode, content: content.trim(), focus } });
      setOutput(res.text);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setContent("");
    setFocus("");
    setOutput("");
    setError(null);
  };

  return (
    <AppShell>
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Summarize a topic, a pasted article, or a web page and get insights you can act on."
      />
      <ToolWorkspace
        submitLabel="Summarize & analyze"
        canSubmit={valid}
        loading={loading}
        error={error}
        output={output}
        onOutputChange={setOutput}
        onSubmit={submit}
        onReset={reset}
        emptyHint="Summary, key insights, recommendations, and takeaways will appear here."
        form={
          <>
            <Field label="Source">
              <SegmentedControl
                options={MODES}
                value={mode}
                onChange={(m) => {
                  setMode(m);
                  setContent("");
                }}
              />
            </Field>
            <Field label={mode === "URL" ? "Web page address" : mode === "Article" ? "Article text" : "Topic"}>
              {mode === "URL" ? (
                <input className={inputClass} type="url" placeholder={PLACEHOLDERS.URL} value={content} onChange={(e) => setContent(e.target.value)} />
              ) : (
                <textarea
                  className={`${inputClass} ${mode === "Article" ? "min-h-48" : "min-h-28"}`}
                  placeholder={PLACEHOLDERS[mode]}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
            </Field>
            <Field label="Focus" hint="optional">
              <input className={inputClass} placeholder="e.g. implications for a 20-person marketing team" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </Field>
            {mode === "URL" && (
              <p className="text-xs text-muted-foreground">
                Pages behind logins or paywalls can't be read. Public articles and docs work best.
              </p>
            )}
          </>
        }
      />
    </AppShell>
  );
}
