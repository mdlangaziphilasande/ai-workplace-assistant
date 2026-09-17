import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE_RULES =
  "You are an AI Workplace Productivity Assistant. Respond in clean Markdown-free plain text with clear headings in Title Case followed by a colon, short paragraphs, and hyphen bullet points where useful. Never use asterisks or hash symbols. Be specific to the user's input; never give generic filler.";

const EmailInput = z.object({
  instructions: z.string().trim().min(5).max(3000),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  recipient: z.string().trim().max(200).optional(),
  sender: z.string().trim().max(200).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt } = await import("./ai-gateway.server");
    const system = `${BASE_RULES} You write professional workplace emails. Output exactly: a line starting with "Subject: ", a blank line, then the email body ending with a sign-off. No commentary before or after.`;
    const prompt = `Tone: ${data.tone}.
${data.recipient ? `Recipient: ${data.recipient}.` : ""}
${data.sender ? `Sender name for sign-off: ${data.sender}.` : ""}
What the email must accomplish:
${data.instructions}`;
    return { text: await runPrompt(system, prompt) };
  });

const PlanInput = z.object({
  tasks: z.string().trim().min(5).max(4000),
  horizon: z.enum(["Daily", "Weekly"]),
  hours: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt } = await import("./ai-gateway.server");
    const system = `${BASE_RULES} You are an expert productivity planner. Build a ${data.horizon.toLowerCase()} schedule. Prioritize by deadline, importance, and workload. Structure the answer as: "Priorities:" (ranked list with a one-line reason each), "Schedule:" (${data.horizon === "Daily" ? "time blocks through the day" : "day-by-day blocks for the week"} with estimated durations), and "Recommendations:" (3-5 personalized, actionable tips referencing the user's specific tasks). Keep the total under 450 words.`;
    const prompt = `Tasks, deadlines and context:
${data.tasks}
${data.hours ? `Available working hours: ${data.hours}.` : ""}
${data.notes ? `Additional preferences: ${data.notes}` : ""}`;
    return { text: await runPrompt(system, prompt) };
  });

const ResearchInput = z.object({
  mode: z.enum(["Topic", "Article", "URL"]),
  content: z.string().trim().min(3).max(20000),
  focus: z.string().trim().max(500).optional(),
});

export const researchSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const { runPrompt, fetchPageText } = await import("./ai-gateway.server");
    let source = data.content;
    let sourceLabel = "Topic to research";
    if (data.mode === "URL") {
      source = await fetchPageText(data.content);
      sourceLabel = `Text extracted from ${data.content}`;
    } else if (data.mode === "Article") {
      sourceLabel = "Pasted article";
    }
    const system = `${BASE_RULES} You are a sharp research analyst. Structure the answer as: "Summary:" (a tight paragraph), "Key Insights:" (4-6 bullets), "Recommendations:" (3-4 bullets), and "Actionable Takeaways:" (3 bullets the reader can do this week). Ground every point in the provided source; if the source is a bare topic, use your own knowledge and say so briefly. Keep under 450 words.`;
    const prompt = `${sourceLabel}:
${source}
${data.focus ? `\nFocus the analysis on: ${data.focus}` : ""}`;
    return { text: await runPrompt(system, prompt) };
  });
