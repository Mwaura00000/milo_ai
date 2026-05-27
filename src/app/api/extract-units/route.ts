import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawKey = process.env.GEMINI_API_KEY ?? "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const { base64Data, mimeType } = await req.json() as {
      base64Data: string;
      mimeType: string;
    };

    if (!base64Data || !mimeType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    // High fidelity instruction for Gemini Vision to extract modules precisely
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
              text: "Analyze this image, timetable, registration page, or syllabus document. Find and list all standard academic course unit names or modules that the student is taking. For each unit, extract its descriptive name (e.g., 'DATA STRUCTURES AND ALGORITHMS', 'DISTRIBUTED SYSTEMS'). Return the list strictly as a JSON array of strings in this format: [\"Unit Name 1\", \"Unit Name 2\"]. Avoid technical codes like CH or room numbers. Keep the descriptive title (optionally with its unit code prefix if visible, e.g. 'INTE 123 DATA STRUCTURES AND ALGORITHMS'). Be incredibly precise and do not hallucinate modules not in the image. Output only raw JSON. Do not wrap it in markdown code blocks."
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visionPayload),
    });

    if (!response.ok) {
      console.error("Gemini Vision API error status:", response.status);
      return NextResponse.json({ error: `Vision model error: ${response.statusText}` }, { status: 502 });
    }

    const resData = await response.json();
    const parsedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const parsedUnits = JSON.parse(parsedText.trim());

    return NextResponse.json({ units: Array.isArray(parsedUnits) ? parsedUnits : [] });
  } catch (error: any) {
    console.error("API extract units error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
