import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Field, SegmentedControl, ToolWorkspace, errorMessage, inputClass } from "@/components/ToolWorkspace";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | Workplace AI" },
      { name: "description", content: "Generate polished workplace emails in formal, friendly, or persuasive tones with AI." },
      { property: "og:title", content: "Smart Email Generator | Workplace AI" },
      { property: "og:description", content: "Generate polished workplace emails in formal, friendly, or persuasive tones with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { instructions, tone, recipient, sender } });
      setOutput(res.text);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInstructions("");
    setRecipient("");
    setSender("");
    setOutput("");
    setError(null);
  };

  return (
    <AppShell>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Describe what the email needs to do; the AI drafts it in your chosen tone."
      />
      <ToolWorkspace
        submitLabel="Generate email"
        canSubmit={instructions.trim().length >= 5}
        loading={loading}
        error={error}
        output={output}
        onOutputChange={setOutput}
        onSubmit={submit}
        onReset={reset}
        emptyHint="Your drafted email will appear here, ready to edit and copy."
        form={
          <>
            <Field label="Tone">
              <SegmentedControl options={TONES} value={tone} onChange={setTone} />
            </Field>
            <Field label="What should the email say?" hint="Be specific">
              <textarea
                className={`${inputClass} min-h-36`}
                placeholder="e.g. Ask my manager for a two-day extension on the Q3 report because the finance data arrived late. Propose Friday instead of Wednesday."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Recipient" hint="optional">
                <input className={inputClass} placeholder="e.g. Sarah, Head of Ops" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </Field>
              <Field label="Your name" hint="optional">
                <input className={inputClass} placeholder="For the sign-off" value={sender} onChange={(e) => setSender(e.target.value)} />
              </Field>
            </div>
          </>
        }
      />
    </AppShell>
  );
}
