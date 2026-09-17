import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Field, SegmentedControl, ToolWorkspace, errorMessage, inputClass } from "@/components/ToolWorkspace";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | Workplace AI" },
      { name: "description", content: "Turn a task list into a prioritized daily or weekly schedule with personalized recommendations." },
      { property: "og:title", content: "AI Task Planner | Workplace AI" },
      { property: "og:description", content: "Turn a task list into a prioritized daily or weekly schedule with personalized recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Daily", "Weekly"] as const;

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Daily");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { tasks, horizon, hours, notes } });
      setOutput(res.text);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTasks("");
    setHours("");
    setNotes("");
    setOutput("");
    setError(null);
  };

  return (
    <AppShell>
      <PageHeader
        icon={CalendarCheck}
        title="AI Task Planner"
        description="List your tasks with deadlines and importance; get a prioritized schedule and tailored advice."
      />
      <ToolWorkspace
        submitLabel="Build my plan"
        canSubmit={tasks.trim().length >= 5}
        loading={loading}
        error={error}
        output={output}
        onOutputChange={setOutput}
        onSubmit={submit}
        onReset={reset}
        emptyHint="Your prioritized schedule and recommendations will appear here."
        form={
          <>
            <Field label="Plan type">
              <SegmentedControl options={HORIZONS} value={horizon} onChange={setHorizon} />
            </Field>
            <Field label="Tasks, deadlines and importance" hint="One per line works best">
              <textarea
                className={`${inputClass} min-h-40`}
                placeholder={"Finish client proposal – due Thursday, high importance, ~4h\nReview 3 pull requests – today, medium\nPrepare slides for Monday all-hands – low urgency, ~2h\n1:1 with Priya – Wed 2pm"}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Working hours" hint="optional">
                <input className={inputClass} placeholder="e.g. 9:00–17:30" value={hours} onChange={(e) => setHours(e.target.value)} />
              </Field>
              <Field label="Preferences" hint="optional">
                <input className={inputClass} placeholder="e.g. deep work mornings, no meetings Friday" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          </>
        }
      />
    </AppShell>
  );
}
