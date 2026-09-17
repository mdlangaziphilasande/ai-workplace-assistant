import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Mail, Search, ShieldCheck, Timer, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, plan your week, and research faster with AI tools built for busy professionals." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, plan your week, and research faster with AI tools built for busy professionals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const CARDS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    blurb: "Turn a few bullet points into a polished email in a formal, friendly, or persuasive tone.",
    tint: "bg-sky text-sky-foreground",
  },
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "AI Task Planner",
    blurb: "Get a prioritized daily or weekly schedule built around your deadlines and workload.",
    tint: "bg-violet text-violet-foreground",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    blurb: "Summarize topics, pasted articles, or web pages into insights and next steps.",
    tint: "bg-accent text-accent-foreground",
  },
] as const;

const PERKS = [
  { icon: Zap, text: "Genuinely tailored output for every request, never templates." },
  { icon: Timer, text: "Editable results with one-click copy so you can move fast." },
  { icon: ShieldCheck, text: "Nothing is saved. Your inputs vanish when you close the tab." },
];

function Dashboard() {
  return (
    <AppShell>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet px-3 py-1 text-xs font-semibold text-violet-foreground">
          Powered by Lovable AI
        </p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Work smarter with your <span className="gradient-text">AI productivity assistant</span>
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Three focused tools for the tasks that eat your day: writing emails, planning your time, and making sense of
          information.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {CARDS.map(({ to, icon: Icon, title, blurb, tint }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
          >
            <span className={`grid size-11 place-items-center rounded-xl ${tint}`}>
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open tool <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
