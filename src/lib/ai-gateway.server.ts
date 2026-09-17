import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      const next = response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim();
      if (!runId && next) runId = next;
      return response;
    }) as typeof fetch,
    getRunId: () => runId,
  };
}

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Run a single prompt through Lovable AI and return the full text. */
export async function runPrompt(system: string, prompt: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiGatewayError(401, "AI service is not configured.");

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system,
      prompt,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          store: false,
        },
      },
    });
    const text = (await result.text).trim();
    if (!text) throw new AiGatewayError(502, "The AI returned an empty response. Please try again.");
    return text;
  } catch (err: unknown) {
    if (err instanceof AiGatewayError) throw err;
    const e = err as { statusCode?: number; status?: number; message?: string; responseBody?: string };
    const status = e.statusCode ?? e.status ?? 500;
    let message = e.message ?? "AI request failed.";
    try {
      const parsed = JSON.parse(e.responseBody ?? "");
      if (parsed?.error?.message) message = parsed.error.message;
      else if (parsed?.message) message = parsed.message;
    } catch {
      /* keep message */
    }
    if (status === 429) message = "Rate limit reached. Please wait a moment and try again.";
    if (status === 402) message = "AI credits are exhausted. Please add credits to your Lovable workspace to continue.";
    throw new AiGatewayError(status, message);
  }
}

/** Fetch a web page and reduce it to readable text for research. */
export async function fetchPageText(url: string): Promise<string> {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) throw new AiGatewayError(400, "Only http(s) URLs are supported.");
  const res = await fetch(parsed.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ProductivityAssistant/1.0)", Accept: "text/html,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  }).catch(() => {
    throw new AiGatewayError(400, "Could not reach that URL. Check the address and try again.");
  });
  if (!res.ok) throw new AiGatewayError(400, `The website responded with status ${res.status}.`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 200) throw new AiGatewayError(400, "That page has too little readable text to summarize.");
  return text.slice(0, 14000);
}
