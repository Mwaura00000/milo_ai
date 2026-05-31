import { NextRequest, NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

export async function POST(req: NextRequest) {
  const rawKey = process.env.GEMINI_API_KEY ?? "";
  const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { messages, systemPrompt } = body as {
      messages: { role: "user" | "model"; parts: { text: string }[] }[];
      systemPrompt: string;
    };

    // Convert Gemini format messages to Vercel AI SDK format
    const aiSdkMessages = messages.map((m) => ({
      role: m.role === "model" ? ("assistant" as const) : ("user" as const),
      content: m.parts?.[0]?.text ?? "",
    }));

    const google = createGoogleGenerativeAI({ apiKey });
    let lastError = "";

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${modelName} via Vercel AI SDK...`);
        const response = await generateText({
          model: google(modelName),
          system: systemPrompt,
          messages: aiSdkMessages,
          tools: {
            // ── Tool 1: Live web search ─────────────────────────────────────
            searchWeb: tool({
              description: "Search the web using Serper API for real-time information, recent events, academic syllabi, course guidelines, medical/clinical facts, or modern programming details.",
              inputSchema: z.object({
                query: z.string().describe("The search query to look up on the web"),
              }),
              execute: async ({ query }) => {
                try {
                  const serperApiKey = process.env.SERPER_API_KEY || "883b14a605bdb7656826796694db81211eeab0be";
                  const res = await fetch("https://google.serper.dev/search", {
                    method: "POST",
                    headers: {
                      "X-API-KEY": serperApiKey,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ q: query }),
                  });

                  if (!res.ok) {
                    console.error("Serper API error status:", res.status);
                    return { results: [], error: `Search failed with status ${res.status}` };
                  }

                  const data = await res.json();
                  const organic = data?.organic || [];
                  const cleanResults = organic.map((item: any) => ({
                    title: item.title || "",
                    link: item.link || "",
                    snippet: item.snippet || "",
                  })).slice(0, 5);

                  console.log(`Serper search completed for query: "${query}"`);
                  return { results: cleanResults, query };
                } catch (err) {
                  console.error("Serper search tool error:", err);
                  return { results: [], error: "Internal search execution error" };
                }
              },
            }),

            // ── Tool 2: Implementation intention setter ─────────────────────
            startStudySession: tool({
              description: "Set a concrete implementation intention (if-then plan) for a study session. Call this whenever the student says they 'should', 'need to', 'want to', or 'plan to' study, or after a neglect nudge, or when breaking procrastination. Transforms vague intentions into specific commitments.",
              inputSchema: z.object({
                time: z.string().describe("The planned start time, e.g. '7:00 PM' or 'right now'"),
                location: z.string().describe("Where the student will study, e.g. 'my desk', 'the library', 'a quiet corner'"),
                task: z.string().describe("What they will study — specific and concrete, e.g. 'Chapter 3 — Cell Division' or 'Past paper questions on torts'"),
                subject: z.string().describe("The subject name to pre-fill in the Focus Timer"),
                durationMinutes: z.number().describe("Recommended session length in minutes, e.g. 25 for sprint or 50 for marathon"),
              }),
              execute: async ({ time, location, task, subject, durationMinutes }) => {
                const intention = `If it is ${time} and I am at ${location}, then I will start my ${task} session.`;
                console.log(`startStudySession fired: ${intention}`);
                return { intention, subject, time, location, task, durationMinutes, locked: true };
              },
            }),
          },
        } as any);

        let finalText = response.text || "";

        // ── Detect startStudySession tool call ──────────────────────────────
        const sessionToolResult = (response.toolResults as any[])?.find(
          (r: any) => r.toolName === "startStudySession" && r.output?.locked
        );
        if (sessionToolResult) {
          const output = sessionToolResult.output as any;
          if (!finalText || finalText.trim() === "") {
            finalText = `Locked in. "${output.intention}" Open the Focus Timer and begin your ${output.durationMinutes}-minute session.`;
          }
          console.log(`Gemini responded using ${modelName} [+startStudySession]`);
          return NextResponse.json({
            text: finalText,
            model: modelName,
            sessionIntent: {
              subject: output.subject,
              durationMinutes: output.durationMinutes,
              intention: output.intention,
            },
          });
        }

        // ── Detect searchWeb with empty text — force synthesis ──────────────
        if (finalText.trim() === "" && response.toolResults && (response.toolResults as any[]).length > 0) {
          const results = (response.toolResults as any[])[0].output?.results || [];
          if (results.length > 0) {
            console.log("Empty text after searchWeb. Forcing synthesis...");
            const synthesisResponse = await generateText({
              model: google(modelName),
              system: "You are Milo, an elite Socratic study coach. Synthesize the following search results into a focused, concise academic answer in your own words. No raw URLs, no bullet-dumping, no emojis. Weave facts naturally into a 2-4 sentence Socratic explanation.",
              messages: [
                ...aiSdkMessages,
                { role: "assistant", content: "I searched the web and found: " + JSON.stringify(results) }
              ]
            });
            finalText = synthesisResponse.text || "I found some information but I am having trouble synthesising it right now. Try asking again in a moment.";
          }
        }

        if (!finalText || finalText.trim() === "") {
          console.error("Empty text response. Tool calls:", response.toolCalls);
          throw new Error("Empty text. ToolCalls: " + JSON.stringify(response.toolCalls));
        }

        console.log(`Gemini responded via Vercel AI SDK using ${modelName}`);
        return NextResponse.json({ text: finalText, model: modelName });

      } catch (err: any) {
        const errText = err?.message || String(err);
        console.warn(`Model ${modelName} failed or was rate-limited:`, errText);
        lastError = errText;
        continue;
      }
    }

    // All models exhausted
    const isQuota = lastError.includes("429") || lastError.includes("RESOURCE_EXHAUSTED") || lastError.includes("quota");
    if (isQuota) {
      return NextResponse.json(
        { text: "Milo's AI quota is exhausted for today — a free-tier limit. Try again tomorrow or upgrade your Gemini API plan at aistudio.google.com." },
        { status: 200 }
      );
    }

    console.error("All Gemini models failed. Last error:", lastError);
    return NextResponse.json({ error: "No available Gemini model found", details: lastError }, { status: 500 });

  } catch (error) {
    console.error("Buddy route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
