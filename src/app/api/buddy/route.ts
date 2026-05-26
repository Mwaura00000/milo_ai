import { NextRequest, NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
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

                  console.log(`✓ Serper search completed for query: "${query}"`);
                  return { results: cleanResults, query };
                } catch (err) {
                  console.error("Serper search tool error:", err);
                  return { results: [], error: "Internal search execution error" };
                }
              },
            }),
          },
          maxSteps: 3, // Support multi-step execution (tool calling + final output generation)
        } as any);

        console.log(`✓ Gemini responded via Vercel AI SDK using ${modelName}`);
        return NextResponse.json({ text: response.text, model: modelName });
      } catch (err: any) {
        const errText = err?.message || String(err);
        console.warn(`Model ${modelName} failed or was rate-limited:`, errText);
        lastError = errText;
        continue;
      }
    }

    // All models exhausted — check if it was a quota issue
    const isQuota = lastError.includes("429") || lastError.includes("RESOURCE_EXHAUSTED") || lastError.includes("quota");
    if (isQuota) {
      return NextResponse.json(
        { text: "Milo's API quota is exhausted for today. This is a free-tier limit. Try again tomorrow or upgrade your Gemini API plan at aistudio.google.com." },
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
