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

    // Try gemini-1.5-pro first, fall back to gemini-1.5-flash
    const VISION_MODELS = ["gemini-1.5-pro", "gemini-1.5-flash"];
    let lastStatus = 0;
    let lastStatusText = "";

    for (const modelName of VISION_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visionPayload),
      });

      if (!response.ok) {
        lastStatus = response.status;
        lastStatusText = response.statusText;
        console.warn(`Vision model ${modelName} returned ${response.status}. Trying next...`);
        continue;
      }

      const resData = await response.json();
      const parsedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      try {
        const parsedUnits = JSON.parse(parsedText.trim());
        return NextResponse.json({ units: Array.isArray(parsedUnits) ? parsedUnits : [] });
      } catch (parseErr) {
        console.error("Failed to parse JSON from vision model:", parsedText);
        // Return empty units so the user can add manually — don't hard-fail
        return NextResponse.json({ units: [] });
      }
    }

    // All models failed
    console.error(`All vision models failed. Last status: ${lastStatus} ${lastStatusText}`);
    return NextResponse.json({ units: [], error: `Vision model unavailable (${lastStatus})` }, { status: 200 });
  } catch (error: any) {
    console.error("API extract units error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
