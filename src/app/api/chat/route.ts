import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const rawKey = process.env.GEMINI_API_KEY ?? "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const { messages } = await req.json();

    const systemPrompt = `You are Milo, the elite Socratic academic study coach helping a student master complex concepts and onboard conversational-style.

CONVERSATIONAL SOCRATIC WORKFLOW:
1. Welcoming Hook: Welcome them warmly (e.g. "Sawa! Welcome to Milo. I am your cognitive study coach.").
2. Step-by-step guidance: Ask them conversational questions about what degree program they are taking and at which university.
3. Call the appropriate tools:
   - If they specify their university and degree (e.g., "B.Sc. Nursing at University of Nairobi"), IMMEDIATELY call the "query_university_matrix" tool.
   - If they mention having a registration PDF, syllabus image, or syllabus screenshot, invite them to attach/upload it, and once uploaded, IMMEDIATELY call the "extract_units_from_document" tool to extract the unit names.
   - If you want to explain a concept using a real-world analogy, YOU MUST explicitly invoke the "showAnalogyCard" tool.
   - If you need to search the web for recent information, current events, modern framework documentation, APIs, legal cases, real-time facts, or anything outside your model training data, YOU MUST invoke the "searchWeb" tool.
4. Fallback Suggestion Layer: If "query_university_matrix" returns no units, DO NOT give up! Use your own vast academic knowledge base to dynamically suggest 4 to 5 standard first-year units for that specific degree. Say: "I couldn't find official records in my database, but here are the standard units normally taken for this course. Do these look correct?" and list them clearly so the student can confirm them.

Be warm, Socratic, snappy, and encouraging. Use Kenyan academic style naturally (e.g., "Sawa!", "Poa!").

CRITICAL TOOL CALLING COMMANDS:
- You are strictly forbidden from using custom text tags (like [ANALOGY_START]) or markdown code blocks to format your analogies. If you want to provide an analogy, YOU MUST explicitly invoke the "showAnalogyCard" tool using the standard function calling API. Do not write the analogy data directly into the chat stream.
- When you call a tool (like showAnalogyCard or searchWeb), your accompanying text response must consist of exactly one short introductory sentence leading into the card, with zero post-tool filler or premature questions. Let the tool render, wait for the student to react, and ask check questions only in your NEXT turn.
- CRITICAL SEARCH RULE: When you use the "searchWeb" tool, you must NEVER dump the raw search snippets, titles, or raw URLs directly into the chat. You must read the search results silently, synthesize the information, and explain the core concepts in your own words. Maintain your persona as Milo, the elite Socratic tutor. If you need to cite a fact, weave it naturally into your explanation.`;

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      maxSteps: 5,
      messages,
      tools: {
        query_university_matrix: tool({
          description: "Query standard Year 1/Semester 1 default unit list for a specific university and degree course program.",
          inputSchema: z.object({
            university: z.string().describe("The university name, e.g. 'University of Nairobi' or 'Kabarak University'"),
            degree: z.string().describe("The degree course program name, e.g. 'B.Sc. Nursing' or 'IT and Law'"),
          }),
          execute: async ({ university, degree }) => {
            try {
              const { data, error } = await supabase
                .from("university_matrix")
                .select("default_units")
                .eq("university_name", university)
                .eq("degree_name", degree);

              if (error) {
                console.error("Database query error:", error);
                return { units: [], source: "fallback", university: university || "", degree: degree || "" };
              }

              if (data && data.length > 0) {
                const units = typeof data[0].default_units === "string" 
                  ? JSON.parse(data[0].default_units) 
                  : data[0].default_units;
                return { units: Array.isArray(units) ? (units as string[]) : [], source: "database", university: university || "", degree: degree || "" };
              }
              return { units: [], source: "fallback", university: university || "", degree: degree || "" };
            } catch (err) {
              console.error("Tool execution failed:", err);
              return { units: [], source: "fallback", university: university || "", degree: degree || "" };
            }
          },
        }),
        extract_units_from_document: tool({
          description: "Extract list of course unit names from an attached syllabus image, timetable snapshot, or registration document.",
          inputSchema: z.object({
            base64Data: z.string().describe("The base64 encoded document image or PDF content"),
            mimeType: z.string().describe("The MIME file type of the attachment, e.g. 'image/png' or 'image/jpeg'"),
          }),
          execute: async ({ base64Data, mimeType }) => {
            try {
              const visionPayload = {
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        inlineData: {
                          mimeType: mimeType,
                          data: base64Data
                        }
                      },
                      {
                        text: "Analyze this course registration, timetable, or syllabus document. Find and list all standard academic course unit names that the student is enrolled in for this semester. Return the names strictly as a JSON array of strings in this format: [\"Unit Name 1\", \"Unit Name 2\"]. Do not output any markdown code blocks or surrounding text, just the raw JSON array."
                      }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json"
                }
              };

              const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
              const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visionPayload),
              });

              if (!response.ok) {
                console.error("OCR API error status:", response.status);
                return { units: ["Intro to College Studies", "Analytical Writing"], source: "ocr-fallback" };
              }

              const resData = await response.json();
              const parsedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
              const parsedUnits = JSON.parse(parsedText.trim());

              return { units: Array.isArray(parsedUnits) ? (parsedUnits as string[]) : [], source: "ocr" };
            } catch (e) {
              console.error("Vision extract execution failed:", e);
              return { units: ["Intro to College Studies", "Analytical Writing"], source: "ocr-fallback" };
            }
          },
        }),
        searchWeb: tool({
          description: "Search the web using Serper API for real-time information, recent events, APIs, legal cases, and current documentation.",
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

              return { results: cleanResults, query };
            } catch (err) {
              console.error("Serper search tool error:", err);
              return { results: [], error: "Internal search execution error" };
            }
          },
        }),
        showAnalogyCard: tool({
          description: "Provide a creative, structural, real-world analogy to explain a complex academic concept to the student.",
          inputSchema: z.object({
            concept: z.string().describe("The academic concept name to explain"),
            analogy: z.string().describe("The simple, highly creative real-world analogy explaining the concept"),
          }),
          execute: async ({ concept, analogy }) => {
            return { concept, analogy };
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Onboarding API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
