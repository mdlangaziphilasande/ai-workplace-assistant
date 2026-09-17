import { Check, Copy, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            o === value ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ToolWorkspace({
  form,
  onSubmit,
  canSubmit,
  submitLabel,
  loading,
  error,
  output,
  onOutputChange,
  onReset,
  emptyHint,
}: {
  form: ReactNode;
  onSubmit: () => void;
  canSubmit: boolean;
  submitLabel: string;
  loading: boolean;
  error: string | null;
  output: string;
  onOutputChange: (v: string) => void;
  onReset: () => void;
  emptyHint: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <form
        className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !loading) onSubmit();
        }}
      >
        {form}
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="gradient-brand inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating…" : submitLabel}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </div>
      </form>

      <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">AI output</h2>
          <button
            type="button"
            onClick={copy}
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-md bg-sky px-2.5 py-1.5 text-xs font-medium text-sky-foreground transition hover:brightness-95 disabled:opacity-40"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {loading ? (
          <div className="flex flex-1 flex-col gap-3 p-5">
            {[90, 100, 75, 95, 60, 85].map((w, i) => (
              <div key={i} className="h-3.5 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
            ))}
            <p className="mt-auto text-xs text-muted-foreground">Thinking through your request…</p>
          </div>
        ) : output ? (
          <textarea
            value={output}
            onChange={(e) => onOutputChange(e.target.value)}
            aria-label="Editable AI output"
            className="flex-1 resize-none bg-transparent p-5 font-sans text-sm leading-relaxed outline-none"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-violet text-violet-foreground">
              <Sparkles className="size-5" />
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        )}
        {output && !loading && (
          <p className="border-t border-border px-5 py-2 text-[11px] text-muted-foreground">
            You can edit this text directly before copying. Review for accuracy.
          </p>
        )}
      </section>
    </div>
  );
}

export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as Error).message === "string") {
    return (err as Error).message;
  }
  return "Something went wrong. Please try again.";
}
