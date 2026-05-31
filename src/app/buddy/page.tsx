"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Send, BrainCircuit, Check, X, AlertCircle, Layers,
  BookOpen, Zap, TrendingUp, TrendingDown, Minus as TrendMinus,
  ChevronDown, ChevronUp, RotateCcw, Sparkles, Clock, Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  analyzeStudyPatterns,
  getSessionsFromStorage,
  getSubjectsFromStorage,
  type StudyPattern,
} from "@/lib/study-patterns";
import { AnalogyCard } from "@/components/AnalogyCard";
import { ExampleSnippet } from "@/components/ExampleSnippet";
import { MiloMarkdown } from "@/components/MiloMarkdown";

// ─── Cognitive Persona Card type (from cognitive-engine output) ───────────────
interface PersonaCard {
  name: string;
  description: string;
  strategies: string[];
  tags: {
    focusStyle: string;    // "Sprint" | "Marathon"
    energyPeak: string;    // "Morning" | "Afternoon" | "Night"
    dominantHabit: string;
    primaryFriction: string;
  };
}


// ─── Types ───────────────────────────────────────────────────────────────────

type MessageRole = "assistant" | "user";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface Quiz {
  question: string;
  options: QuizOption[];
  explanation: string;
  userAnswer?: number;
}

interface Flashcard {
  front: string;
  back: string;
  flipped?: boolean;
  rating?: number;
}

interface Analogy {
  concept: string;
  analogy: string;
}

interface Example {
  concept: string;
  codeOrBrief: string;
  explanation: string;
}

type MessageType = "chat" | "quiz" | "flashcards" | "insight" | "analogy" | "example";

interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  quiz?: Quiz;
  flashcards?: Flashcard[];
  analogy?: Analogy;
  example?: Example;
  isStreaming?: boolean;
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(
  name: string,
  university: string,
  course: string,
  yearSem: string,
  subjects: string[],
  activeSubject: string,
  pattern: StudyPattern | null,
  focusCapacity: string,
  energyRhythm: string,
  processingStyle: string,
  frictionType: string,
  grindModeActive = false,
  grindModeSubject = "",
  grindModeTopic = "",
  personaCard: PersonaCard | null = null,
  isWeeklyReflection = false,
): string {
  const patternContext = pattern
    ? `
STUDENT STUDY BEHAVIOUR DATA (from real session telemetry):
- Overall mastery average: ${pattern.overallMastery}/5
- Focus quality score: ${pattern.overallFocusQuality}/100
- Total study minutes logged: ${pattern.totalStudyMinutes} min
- Total sessions: ${pattern.totalSessions}
- Study streak: ${pattern.streakDays} consecutive days
- Weakest subjects: ${pattern.weakestSubjects.map((s) => `${s.name} (${s.avgMastery}/5)`).join(", ") || "none identified yet"}
- Neglected subjects (3+ days): ${pattern.neglectedSubjects.map((s) => `${s.name} (${s.daysSinceLastStudy}d ago)`).join(", ") || "none"}
- Recommended study style: ${pattern.studyStyleRecommendation}
Per-subject data:
${pattern.subjectStats
  .filter((s) => s.sessionsCount > 0)
  .map(
    (s) =>
      `  • ${s.name}: mastery=${s.avgMastery}/5, ${s.totalMinutes}min total, ${s.sessionsCount} sessions, trend=${s.trend}, last studied=${s.daysSinceLastStudy !== null ? s.daysSinceLastStudy + "d ago" : "never"}`
  )
  .join("\n")}
`
    : "No study sessions logged yet. Encourage the student to use the Focus Timer to build their study history.";

  // ── Cognitive Persona Card (from Cognitive Engine assessment) ─────────────
  const personaCardContext = personaCard
    ? `
## COGNITIVE PERSONA CARD (highest-priority personalisation input)
- Persona Name: ${personaCard.name}
- Focus Style: ${personaCard.tags.focusStyle}  (Sprint = short intense bursts | Marathon = long deep-work blocks)
- Energy Peak: ${personaCard.tags.energyPeak}  (when their brain is sharpest)
- Dominant Habit: ${personaCard.tags.dominantHabit}
- Primary Friction: ${personaCard.tags.primaryFriction}
- Prescriptive Strategies: ${personaCard.strategies.join(" | ")}
- Persona Description: ${personaCard.description}
`
    : "";

  // ── Persona-Aware Personalisation Rules ──────────────────────────────────
  const focusStyle = personaCard?.tags?.focusStyle?.toLowerCase() || focusCapacity?.toLowerCase() || "";
  const energyPeak = personaCard?.tags?.energyPeak?.toLowerCase() || energyRhythm?.toLowerCase() || "";
  const habit = personaCard?.tags?.dominantHabit?.toLowerCase() || "";
  const friction = personaCard?.tags?.primaryFriction?.toLowerCase() || frictionType?.toLowerCase() || "";
  const defaultDuration = focusStyle.includes("marathon") ? 50 : 25;

  const personalisationRules = `
## PERSONALISATION DIRECTIVES — shape every response to this persona

### Focus Style: ${focusStyle || "unknown"}
${focusStyle.includes("sprint")
    ? "Keep messages short, punchy, action-oriented. Use bullet points. Check in every 2-3 sentences. Offer 5-minute micro-quizzes proactively. Never write walls of text."
    : focusStyle.includes("marathon")
    ? "You may give richer, deeper explanations. Suggest 50-90 minute deep-work blocks. Build elaborate conceptual scaffolds. Reward patience and depth."
    : "Use moderate depth. Match the student's evident pace."}

### Energy Peak: ${energyPeak || "unknown"}
${energyPeak.includes("morning")
    ? "Reference mornings naturally: 'Your brain is sharpest early — let us tackle the hardest concept now.'"
    : energyPeak.includes("night")
    ? "Acknowledge their night-owl rhythm: 'Tonight is your most productive window. Use it well.'"
    : energyPeak.includes("afternoon")
    ? "Reference afternoons: 'Your peak window is midday — schedule the hardest topics then.'"
    : ""}

### Dominant Habit: ${habit || "unknown"}
${habit.includes("re-read") || habit.includes("passive")
    ? "CRITICAL: After EVERY explanation, immediately ask an active recall question. Never end a turn with a passive summary. The student must produce output, not just receive it."
    : habit.includes("self-test")
    ? "Praise their retrieval instinct. Suggest interleaved practice. Propose harder mixed-format challenges."
    : habit.includes("summaris")
    ? "After each explanation, invite them to write a 2-sentence summary in their own words, then quiz them on it immediately."
    : habit.includes("discuss") || habit.includes("teach")
    ? "After explaining, ask them to teach it back to you as if you are a confused junior student. Use the Feynman technique explicitly."
    : ""}

### Primary Friction: ${friction || "unknown"}
${friction.includes("forgetting") || friction.includes("forgetting curve")
    ? "Always mention spaced repetition intervals (e.g. 'Review this again in 2 days, then 5, then 12'). Prioritise flashcards. Build retrieval habit explicitly."
    : friction.includes("understanding") || friction.includes("clarity")
    ? "Lead with analogies and dual coding. Ask 'why' and 'how' questions. Use elaborative interrogation. Break every concept to its foundational axiom."
    : friction.includes("concentration") || friction.includes("scattered")
    ? "Keep messages under 3 sentences. Never write long paragraphs. Interject with rapid-fire active recall every 2 exchanges. Recommend the Focus Timer immediately."
    : friction.includes("motivation") || friction.includes("procrastin") || friction.includes("pause")
    ? "At the first sign of resistance, shift into Motivational Interviewing mode (see below). Never lecture or guilt-trip."
    : friction.includes("time") || friction.includes("clock")
    ? "Always anchor advice to specific time blocks. Build if-then plans immediately. Use the startStudySession tool as soon as there is any commitment."
    : friction.includes("anxiety") || friction.includes("anxious")
    ? "Normalise the feeling first ('That tension before exams is your brain caring — let us channel it'). Break tasks into micro-steps. Never rush. Offer box breathing if needed."
    : ""}

### Processing Style: ${processingStyle || "unknown"}
${processingStyle.toLowerCase().includes("step")
    ? "Use numbered lists, linear progressions, and concrete rules. Deliver detail before abstraction."
    : processingStyle.toLowerCase().includes("big")
    ? "Start every explanation with a high-level analogy or concept map, then zoom into specifics."
    : ""}
`;

  // ── Neglect nudge ─────────────────────────────────────────────────────────
  const neglectedSubjects = pattern?.neglectedSubjects || [];
  const neglectNudge = neglectedSubjects.length > 0
    ? `
## PROACTIVE NEGLECT NUDGE — OPEN WITH THIS BEFORE ANY OTHER CONTENT
You MUST begin this conversation with this exact nudge:
"Hey ${name}, it has been ${neglectedSubjects[0].daysSinceLastStudy} day${neglectedSubjects[0].daysSinceLastStudy === 1 ? "" : "s"} since you reviewed ${neglectedSubjects[0].name}. Even a 5-minute retrieval session right now can double what you remember later. Want to do a quick flashcard round?"
Immediately offer to call startStudySession if the student agrees.
`
    : "";

  // ── Motivational Interviewing mode ────────────────────────────────────────
  const miMode = `
## MOTIVATIONAL INTERVIEWING MODE
If the student shows any resistance, low drive, or ambivalence — phrases like "I can't", "I don't feel like it", "maybe later", "I'm too tired", "what's the point" — PAUSE all academic content and run this 4-step script:
1. Ask importance: "On a scale of 1 to 10, how important is it for you to study this right now?"
2. Explore discrepancy: If they answer (e.g. 6), ask "Why a 6 and not a 4?" — this makes them argue for change themselves.
3. Reflect and affirm: "So even though you are tired, you still care about doing well. That resolve matters."
4. Elicit the tiny step: "What is one small thing — even just 2 minutes — you could do right now that would make you feel you have moved forward?"
Once they commit to anything, IMMEDIATELY call startStudySession to lock it in.
`;

  // ── startStudySession tool instructions ───────────────────────────────────
  const sessionToolInstructions = `
## startStudySession TOOL — MANDATORY USAGE RULES
You have a tool called startStudySession. You MUST call it whenever:
- The student says they "should", "need to", "want to", "plan to", or "am going to" study.
- After the neglect nudge and the student agrees to a session.
- After Motivational Interviewing yields any commitment.
- The student asks you to set a timer or schedule a session.

Before calling the tool, phrase the commitment like this:
"Locked in. If it is [time] and I am at [location], then I will start my [task] session."
Then call startStudySession with concrete, specific values — never vague ones.
Default session duration for this persona: ${defaultDuration} minutes.
`;

  // ── Weekly Reflection ─────────────────────────────────────────────────────
  const weeklyReflectionBlock = isWeeklyReflection
    ? `
## WEEKLY REFLECTION MODE — ACTIVE THIS SESSION
Open with: "Before we dive in, let us take 3 minutes for your weekly reflection — it is the single most powerful habit you can build."
Then ask these three questions ONE AT A TIME. Wait for the full answer to each before asking the next:
1. "What is one thing that went well with your studying this week?"
2. "What did not go as planned, or felt difficult?"
3. "What is one small change you will try for next week?"
After all three, summarise warmly and suggest one concrete timetable or strategy adjustment.
`
    : "";

  const cognitiveContext = focusCapacity

    ? `
STUDENT COGNITIVE BIOLOGY & LEARNING PROFILE:
- Focus Capacity: ${focusCapacity}
- Energy Rhythm: ${energyRhythm}
- Mental Processing Style: ${processingStyle}
- Momentum Friction: ${frictionType}

COGNITIVE ALIGNMENT & SEARCH DIRECTIVES:
1. Since the student is a "${processingStyle}":
   - If "Step-by-Step Builder": Always break down explanations into linear logical chains, clear sequential progressions, and numbered lists. Focus heavily on details, formulas, and progressive rules.
   - If "Big Picture Visionary": Always start explanations with high-level summaries, conceptual analogies, and real-world frameworks. Employ the Feynman technique (explain like I'm 5, highlight foundational axioms).
2. Since the student's primary momentum obstacle is "${frictionType}":
   - If "Easily Distracted": Strictly refuse to write long text sections, lectures, or bullet lists. Keep chat messages under 2-3 sentences max. Be extremely snappy, highly interactive, and constantly interject by testing their attention with quick active recall questions.
   - If "Easily Overwhelmed": Chunk concepts into micro-steps. Offer extreme praise, deep emotional reassurance, and explicit pauses: "Does this small piece make total sense? Let's confirm before moving on."
3. **Use Web Search Intelligently**: Use your searchWeb tool to search the web for accurate and real-time syllabi, academic curricula, clinical procedures, case law, or documentation related to their active subject (${activeSubject}) at their specific university (${university || "their university"}). Never make up course contents; search to provide highly contextualized, elite academic coaching.
4. **CRITICAL: NEVER RETURN EMPTY TEXT**: If you invoke a tool like searchWeb, you MUST ALWAYS generate an explanatory text response alongside or immediately following the tool result. Never leave the student hanging with a blank message.
`
    : "";

  const grindModeContext = grindModeActive
    ? `
CRITICAL STUDY FOCUS (GRIND MODE ACTIVE):
- The student has entered "Grind Mode" to focus deeply on this specific unit and topic:
  • Target Unit: ${grindModeSubject}
  • Target Topic: ${grindModeTopic}
- You MUST focus all Socratic dialogue, explanations, analogies, checks, quizzes, and flashcards on helping them master this specific topic (${grindModeTopic}) in this unit (${grindModeSubject}).
- Do not stray to other concepts. Keep them strictly locked in on this concept.
`
    : "";

  return `You are Milo's Buddy — a warm, proactive AI study coach grounded in cognitive science (spaced repetition, retrieval practice, interleaving, elaboration, dual coding, implementation intentions, growth mindset). Your core mission is to turn good intentions into automatic study habits by personalising every interaction to this student's unique cognitive persona.

## ABSOLUTE RULES — NEVER BREAK THESE
- ZERO EMOJIS. Forbidden. No emoji characters anywhere. Be creative with language instead.
- ZERO VERBOSITY. No cheerleader filler ("Excellent choice!", "Great question!", "Let's dive in!"). Be direct, warm, and specific.
- ZERO WALLS OF TEXT. Never write a paragraph where a sentence will do.
- ZERO RAW JSON. Never output raw JSON, triple-backtick blocks, or structured data as plain text.
- ALWAYS USE MARKER FORMAT. When outputting analogies, flashcards, quizzes, or examples, use the exact [TAG_START] / [TAG_END] marker format below.

## STUDENT PROFILE
- Name: ${name || "Scholar"}
- University: ${university || "University"}
- Course: ${course || "Undergraduate"}
- Year / Semester: ${yearSem || "Year 1 Semester 1"}
- Enrolled Subjects: ${subjects.join(", ")}
- Active Subject Right Now: ${activeSubject}

${personaCardContext}

${personalisationRules}

${neglectNudge}

${cognitiveContext}

${grindModeContext}

${patternContext}

${weeklyReflectionBlock}

${miMode}

${sessionToolInstructions}

## SOCRATIC PEDAGOGICAL WORKFLOW
Guide the student through this 4-step learning progression:

1. THE HOOK — explain with a real-world analogy. Write ONE introductory sentence, then the marker block. Nothing after the block.

[ANALOGY_START]
concept: Name of concept here
analogy: The simple analogy explanation text here
[ANALOGY_END]

2. THE EVIDENCE — follow with concrete proof (code, formula, or case law). Write ONE sentence, then the marker block. Nothing after the block.

[EXAMPLE_START]
concept: Name of concept here
code: The actual code, case law, or formula text here
explanation: Brief explanation of how the evidence proves the concept
[EXAMPLE_END]

3. THE CHECK — ask ONE open-ended guiding question to test understanding. Plain text only. Never ask this in the same turn as an analogy or example block.

4. THE TEST — generate flashcards ONLY after the student passes the check.

[FLASHCARDS_START]
Q: Question or term text
A: Answer or definition text
---
Q: Another question
A: Another answer
[FLASHCARDS_END]

For quizzes:

[QUIZ_START]
question: The quiz question text
option: First option text | correct
option: Second option text
option: Third option text
option: Fourth option text
explanation: Why the correct answer is correct
[QUIZ_END]

## PERSONALITY & TONE
- Warm, encouraging, slightly playful — like a trusted older peer with high standards.
- Use the student's name occasionally but not excessively.
- Celebrate small wins concretely: "Three sessions this week — your retrieval strength is compounding."
- Normalise struggle: "That is meant to feel hard. It is how your brain builds new connections."
- Use Kenyan academic warmth where it fits naturally ("Sawa", "Poa") — never forced.
- Never use fear, guilt, or pressure. Be honest about what works, but always supportive.
- Use searchWeb to find accurate, real-time syllabi, clinical procedures, case law, or documentation. Never fabricate course content.
- CRITICAL: Never return empty text after a tool call. Always generate an explanatory response.

## DIAGNOSTIC WORKFLOW (for new students or strategy requests)
If no persona card exists, or the student asks "what should I study?", run the 11-question cognitive diagnostic conversationally (2-3 questions per turn):
1. Main goal: exam-cram / long-term-mastery / skill-performance / project-deadline
2. Familiarity: complete-beginner / some-exposure / intermediate / advanced
3. Study habit: re-read/highlight / summarise / self-test / discuss/teach / passive / mix
4. Metacognition accuracy: well-calibrated / moderately / poorly
5. Biggest obstacle: concentration / motivation / understanding / forgetting / time-management / test-anxiety
6. Hours per week + next deadline date
7. Study environment: quiet / somewhat-noisy / on-the-go
8. Motivation: genuine interest / career / family pressure / fear of failing / competitive drive
9. Focus capacity: Sprint (20-30 min bursts) or Marathon (1-2 hour blocks)
10. Energy peak: morning / afternoon / night
11. Processing style: step-by-step / big-picture

After collecting all answers, generate a Study Personality Label (e.g. "The Strategic Self-tester Rusty Crammer fighting the Forgetting Curve"), prescribe 2-3 evidence-based strategies, and lock in the first session using startStudySession.

Always anchor advice in cognitive science. Never use debunked learning-style myths (VARK). Dynamically update the profile as new details emerge.`;
}



// ─── Parse Gemini response (3-layer: markers → JSON fallback → plain chat) ───

function extractMarkerBlock(text: string, tag: string): { inner: string; rest: string } | null {
  const startTag = `[${tag}_START]`;
  const endTag = `[${tag}_END]`;
  const startIdx = text.indexOf(startTag);
  const endIdx = text.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  const inner = text.slice(startIdx + startTag.length, endIdx).trim();
  const rest = (text.slice(0, startIdx) + text.slice(endIdx + endTag.length)).trim();
  return { inner, rest };
}

function parseMarkerFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = block.split("\n");
  let currentKey = "";
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 20) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      if (key && value) {
        currentKey = key;
        fields[key] = value;
      }
    } else if (currentKey && line.trim()) {
      // Continuation line for multiline fields like code
      fields[currentKey] += "\n" + line;
    }
  }
  return fields;
}

function parseGeminiResponse(text: string): Omit<Message, "id" | "role"> {
  // ── Layer 1: Marker-based parsing (primary) ──

  // ANALOGY
  const analogyBlock = extractMarkerBlock(text, "ANALOGY");
  if (analogyBlock) {
    const fields = parseMarkerFields(analogyBlock.inner);
    if (fields.concept && fields.analogy) {
      return {
        type: "analogy",
        content: analogyBlock.rest,
        analogy: { concept: fields.concept, analogy: fields.analogy },
      };
    }
  }

  // EXAMPLE
  const exampleBlock = extractMarkerBlock(text, "EXAMPLE");
  if (exampleBlock) {
    const fields = parseMarkerFields(exampleBlock.inner);
    if (fields.concept && fields.code) {
      return {
        type: "example",
        content: exampleBlock.rest,
        example: {
          concept: fields.concept,
          codeOrBrief: fields.code,
          explanation: fields.explanation || "",
        },
      };
    }
  }

  // FLASHCARDS
  const flashcardsBlock = extractMarkerBlock(text, "FLASHCARDS");
  if (flashcardsBlock) {
    const cardPairs = flashcardsBlock.inner.split(/---/).filter(Boolean);
    const cards: Flashcard[] = [];
    for (const pair of cardPairs) {
      const qMatch = pair.match(/Q:\s*(.+)/i);
      const aMatch = pair.match(/A:\s*(.+)/i);
      if (qMatch && aMatch) {
        cards.push({ front: qMatch[1].trim(), back: aMatch[1].trim() });
      }
    }
    if (cards.length > 0) {
      return {
        type: "flashcards",
        content: flashcardsBlock.rest,
        flashcards: cards,
      };
    }
  }

  // QUIZ
  const quizBlock = extractMarkerBlock(text, "QUIZ");
  if (quizBlock) {
    const fields = parseMarkerFields(quizBlock.inner);
    const optionLines = quizBlock.inner.split("\n").filter((l) => l.trim().toLowerCase().startsWith("option:"));
    const options: QuizOption[] = optionLines.map((line) => {
      const val = line.slice(line.indexOf(":") + 1).trim();
      const isCorrect = val.toLowerCase().includes("| correct");
      return { text: val.replace(/\|\s*correct/i, "").trim(), correct: isCorrect };
    });
    if (fields.question && options.length >= 2) {
      return {
        type: "quiz",
        content: quizBlock.rest,
        quiz: {
          question: fields.question,
          options,
          explanation: fields.explanation || "",
        },
      };
    }
  }

  // ── Layer 2: JSON fallback (backward compatibility) ──
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      const explanationText = text.replace(jsonMatch[0], "").trim();

      if (parsed.type === "quiz" && parsed.question && parsed.options) {
        return {
          type: "quiz",
          content: explanationText,
          quiz: {
            question: parsed.question,
            options: parsed.options as QuizOption[],
            explanation: parsed.explanation || "",
          },
        };
      }
      if (parsed.type === "flashcards" && parsed.cards) {
        return {
          type: "flashcards",
          content: explanationText,
          flashcards: parsed.cards as Flashcard[],
        };
      }
      if (parsed.type === "analogy" && parsed.concept && parsed.analogy) {
        return {
          type: "analogy",
          content: explanationText,
          analogy: { concept: parsed.concept, analogy: parsed.analogy },
        };
      }
      if (parsed.type === "example" && (parsed.codeOrBrief || parsed.code)) {
        return {
          type: "example",
          content: explanationText,
          example: {
            concept: parsed.concept || "Example",
            codeOrBrief: parsed.codeOrBrief || parsed.code || "",
            explanation: parsed.explanation || "",
          },
        };
      }
    } catch {
      // JSON parse failed — strip the broken code block and return as chat
      const cleaned = text.replace(/```(?:json)?[\s\S]*?```/g, "").trim();
      if (cleaned) {
        return { type: "chat", content: cleaned };
      }
    }
  }

  // ── Layer 3: Plain chat (fallback) ──
  return { type: "chat", content: text };
}

// ─── Mascot helpers ───────────────────────────────────────────────────────────

function getMascot(subject: string): string {
  const n = subject.toLowerCase();
  if (n.includes("math") || n.includes("calculus") || n.includes("programming") || n.includes("computing")) return "/calculator_mascot.png";
  if (n.includes("economics") || n.includes("geography") || n.includes("geo") || n.includes("econ")) return "/earth_mascot.png";
  if (n.includes("chemistry") || n.includes("chem")) return "/chemistry_mascot.png";
  if (n.includes("physics") || n.includes("phys")) return "/physics_mascot.png";
  return "/milo_mascot.png";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuddyPage() {
  const router = useRouter();
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [pattern, setPattern] = useState<StudyPattern | null>(null);
  const [showMemory, setShowMemory] = useState(true);

  // Persona Card & Weekly Reflection
  const [personaCard, setPersonaCard] = useState<PersonaCard | null>(null);
  const [isWeeklyReflection, setIsWeeklyReflection] = useState(false);

  // Grind Mode states
  const [grindActive, setGrindActive] = useState(false);
  const [grindSubject, setGrindSubject] = useState("");
  const [grindTopic, setGrindTopic] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geminiHistory, setGeminiHistory] = useState<
    { role: "user" | "model"; parts: { text: string }[] }[]
  >([]);
  const [forgotStreak, setForgotStreak] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Profile
  const [userName, setUserName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearSem, setYearSem] = useState("");

  // Cognitive metrics
  const [focusCapacity, setFocusCapacity] = useState("");
  const [energyRhythm, setEnergyRhythm] = useState("");
  const [processingStyle, setProcessingStyle] = useState("");
  const [frictionType, setFrictionType] = useState("");

  // Load profile + subjects + pattern + persona
  useEffect(() => {
    setUserName(localStorage.getItem("milo_user_name") || "Scholar");
    setUniversity(localStorage.getItem("milo_user_uni") || "University of Nairobi");
    setCourse(localStorage.getItem("milo_user_course") || "Undergraduate");
    setYearSem(localStorage.getItem("milo_user_year_sem") || "Year 1 Semester 1");

    setFocusCapacity(localStorage.getItem("milo_focus_capacity") || "");
    setEnergyRhythm(localStorage.getItem("milo_energy_rhythm") || "");
    setProcessingStyle(localStorage.getItem("milo_processing_style") || "");
    setFrictionType(localStorage.getItem("milo_friction_type") || "");

    // Load persona card
    const savedPersona = localStorage.getItem("milo_persona_card");
    if (savedPersona) {
      try {
        setPersonaCard(JSON.parse(savedPersona));
      } catch (e) { console.error("Failed to parse persona card", e); }
    }

    // Check weekly reflection logic
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const lastReflectionStr = localStorage.getItem("milo_last_weekly_reflection");
    let needsReflection = isSunday;
    
    if (lastReflectionStr) {
      const lastRef = new Date(lastReflectionStr);
      const daysSince = Math.floor((today.getTime() - lastRef.getTime()) / (1000 * 3600 * 24));
      if (daysSince >= 7) needsReflection = true;
    }
    setIsWeeklyReflection(needsReflection);

    const grindModeActive = localStorage.getItem("milo_grind_mode_active") === "true";
    const grindModeSub = localStorage.getItem("milo_grind_mode_subject") || "";
    const grindModeTop = localStorage.getItem("milo_grind_mode_topic") || "";

    setGrindActive(grindModeActive);
    setGrindSubject(grindModeSub);
    setGrindTopic(grindModeTop);

    const subjects = getSubjectsFromStorage();
    const activeCourse = localStorage.getItem("milo_user_course") || "Undergraduate";
    let finalSubjects = subjects;
    if (activeCourse.toLowerCase().includes("nursing")) {
      const cleaned = subjects.filter(s => s !== "Introduction to Programming" && s !== "Calculus I");
      if (cleaned.length !== subjects.length) {
        localStorage.setItem("milo_active_subjects", JSON.stringify(cleaned));
        finalSubjects = cleaned;
      }
    }
    setSubjectsList(finalSubjects);
    if (grindModeActive && grindModeSub) {
      setActiveSubject(grindModeSub);
    } else if (finalSubjects.length > 0) {
      if (!finalSubjects.includes(activeSubject)) {
        setActiveSubject(finalSubjects[0]);
      }
    }

    const sessions = getSessionsFromStorage();
    const computed = analyzeStudyPatterns(sessions, subjects);
    setPattern(computed);
  }, []);

  const generateGreeting = useCallback(async (isReset = false) => {
    if (!userName) return;
    if (isReset) {
      localStorage.removeItem(`milo_chat_messages_${activeSubject}`);
      localStorage.removeItem(`milo_chat_history_${activeSubject}`);
    }
    setMessages([]);
    setGeminiHistory([]);

    // Build context-aware greeting prompt
    let greetingPrompt = `Greet ${userName} warmly (1–2 sentences max). `;
    
    const chatDiagnosticCompleted = localStorage.getItem("milo_chat_diagnostic_completed") === "true";
    const isDiagnosticRequired = isReset || !chatDiagnosticCompleted;
    
    if (isDiagnosticRequired) {
      greetingPrompt += `Introduce yourself as Milo, the expert cognitive study coach, and explain that you want to run a quick 11-question cognitive study diagnostic to map their learning personality blueprint and build an evidence-based study strategy and Pomodoro schedule. Ask the first 2 or 3 diagnostic questions from your directives list (Goal, Familiarity, and Study Habit) to get started.`;
    } else {
      // Check if currently in an active focus study block
      const activeFocusSub = typeof window !== "undefined" ? localStorage.getItem("active_focus_subject") : null;
      if (activeFocusSub && activeFocusSub.trim().toLowerCase() === activeSubject.trim().toLowerCase()) {
        greetingPrompt += `Mention that you see they are currently in a study block focusing on ${activeFocusSub}. `;
        const subLower = activeFocusSub.toLowerCase();
        if (subLower.includes("civil") || subLower.includes("procedure") || subLower.includes("law")) {
          greetingPrompt += `Say exactly: "Hey! I see we are studying the jurisdiction of the High Court. Do you want me to quiz you on Section 12, or do you need me to explain it?" `;
        } else if (subLower.includes("math") || subLower.includes("calculus") || subLower.includes("algebra")) {
          greetingPrompt += `Say exactly: "Hey! I see we are studying Calculus / Limits and Continuity. Do you want me to quiz you on limits, or do you need me to explain it?" `;
        } else if (subLower.includes("programming") || subLower.includes("computing") || subLower.includes("python")) {
          greetingPrompt += `Say exactly: "Hey! I see we are studying loops and recursion blocks. Do you want me to quiz you on recursion syntax, or do you need me to explain it?" `;
        } else {
          greetingPrompt += `Offer to either quiz them using active recall on the core concepts of ${activeFocusSub} or explain them in simpler terms. `;
        }
      } else if (pattern && pattern.totalSessions > 0) {
        if (pattern.weakestSubjects.length > 0) {
          greetingPrompt += `Mention that you've noticed ${pattern.weakestSubjects[0].name} needs attention (mastery ${pattern.weakestSubjects[0].avgMastery}/5). `;
        } else if (pattern.neglectedSubjects.length > 0) {
          greetingPrompt += `Mention they haven't studied ${pattern.neglectedSubjects[0].name} in ${pattern.neglectedSubjects[0].daysSinceLastStudy} days. `;
        } else if (pattern.streakDays > 1) {
          greetingPrompt += `Mention their ${pattern.streakDays}-day study streak. `;
        }
        greetingPrompt += `Then ask what they'd like to do: ask a question, take a quiz, or get flashcards for ${activeSubject}.`;
      } else {
        greetingPrompt += `Tell them to start with the Focus Timer to build their study profile. `;
        greetingPrompt += `Then ask what they'd like to do: ask a question, take a quiz, or get flashcards for ${activeSubject}.`;
      }
    }

    setIsLoading(true);
    try {
      const sysPrompt = buildSystemPrompt(
        userName, university, course, yearSem, subjectsList, activeSubject, pattern,
        focusCapacity, energyRhythm, processingStyle, frictionType,
        grindActive, grindSubject, grindTopic, personaCard, isWeeklyReflection
      );
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: sysPrompt,
          messages: [{ role: "user", parts: [{ text: greetingPrompt }] }],
        }),
      });
      const data = await res.json();
      const text: string = data.text || "Sasa! I'm your Milo AI coach. What would you like to study today?";

      const parsed = parseGeminiResponse(text);
      const greetMsg: Message = { id: crypto.randomUUID(), role: "assistant", ...parsed };
      setMessages([greetMsg]);
      setGeminiHistory([
        { role: "user", parts: [{ text: greetingPrompt }] },
        { role: "model", parts: [{ text }] },
      ]);
    } catch {
      setMessages([{
        id: crypto.randomUUID(),
        role: "assistant",
        type: "chat",
        content: `Sasa ${userName}! I'm your Milo AI study coach for ${activeSubject}. Ask me a question, request a quiz, or say "flashcards" to get study cards!`,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [userName, university, course, yearSem, subjectsList, activeSubject, pattern, focusCapacity, energyRhythm, processingStyle, frictionType, grindActive, grindSubject, grindTopic]);

  const greetedSubjectRef = useRef<string>("");

  // Save messages & history to local storage when they change
  useEffect(() => {
    if (!activeSubject || !userName || messages.length === 0) return;
    localStorage.setItem(`milo_chat_messages_${activeSubject}`, JSON.stringify(messages));
    localStorage.setItem(`milo_chat_history_${activeSubject}`, JSON.stringify(geminiHistory));
  }, [messages, geminiHistory, activeSubject, userName]);

  // Load messages & history from local storage when activeSubject changes
  useEffect(() => {
    if (!activeSubject || !userName) return;
    const savedMsgs = localStorage.getItem(`milo_chat_messages_${activeSubject}`);
    const savedHist = localStorage.getItem(`milo_chat_history_${activeSubject}`);
    
    if (savedMsgs && savedHist) {
      setMessages(JSON.parse(savedMsgs));
      setGeminiHistory(JSON.parse(savedHist));
      greetedSubjectRef.current = activeSubject;
    } else {
      setMessages([]);
      setGeminiHistory([]);
      greetedSubjectRef.current = activeSubject;
      generateGreeting(false);
    }
  }, [activeSubject, userName, generateGreeting]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);



  const handleSend = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      type: "chat",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const newHistory = [
      ...geminiHistory,
      { role: "user" as const, parts: [{ text: trimmed }] },
    ];

    try {
      const sysPrompt = buildSystemPrompt(
        userName, university, course, yearSem, subjectsList, activeSubject, pattern,
        focusCapacity, energyRhythm, processingStyle, frictionType,
        grindActive, grindSubject, grindTopic, personaCard, isWeeklyReflection
      );
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: sysPrompt, messages: newHistory }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("Buddy API error:", data.error, data.details);
        throw new Error(data.error || "API error");
      }
      const text: string = data.text || "";
      if (!text) throw new Error("Empty response from Gemini");

      const parsed = parseGeminiResponse(text);
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", ...parsed };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.sessionIntent) {
        localStorage.setItem("active_focus_subject", data.sessionIntent.subject || activeSubject);
        localStorage.setItem("active_focus_duration", data.sessionIntent.durationMinutes?.toString() || "25");
        setTimeout(() => {
          router.push("/focus");
        }, 3000);
      }
      setGeminiHistory([
        ...newHistory,
        { role: "model", parts: [{ text }] },
      ]);
    } catch (err) {
      console.error("handleSend error:", err);
      let friendlyError = `Milo Alert: My AI servers are currently experiencing high demand and taking a short breather.`;
      
      if (frictionType === "Easily Overwhelmed") {
        friendlyError += ` Sawa! Don't let this technical glitch overwhelm you. Let's take a deep breath together 🧘. While we wait, review the active subjects on your Today dashboard or try logging a quick study session! Let's try again in a few seconds.`;
      } else if (frictionType === "Easily Distracted") {
        friendlyError += ` Sawa! But don't let this distraction break your momentum or lure you away to social media! Use this 30-second break to perform active self-quiz recall on what we just discussed. Sawa? Let's tap again in a moment!`;
      } else {
        friendlyError += ` No big deal — let's review our notes for 30 seconds and try again! Sawa?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "chat",
          content: friendlyError,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };


  const handleAnswerQuiz = (messageId: string, optionIndex: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.quiz
          ? { ...m, quiz: { ...m.quiz, userAnswer: optionIndex } }
          : m
      )
    );
  };

  const handleFlipCard = (messageId: string, cardIndex: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.flashcards) return m;
        const cards = [...m.flashcards];
        cards[cardIndex] = { ...cards[cardIndex], flipped: !cards[cardIndex].flipped };
        return { ...m, flashcards: cards };
      })
    );
  };

  const handleRateCard = (messageId: string, cardIndex: number, score: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.flashcards) return m;
        const cards = [...m.flashcards];
        cards[cardIndex] = { ...cards[cardIndex], rating: score };
        return { ...m, flashcards: cards };
      })
    );

    if (score === 1) {
      setForgotStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak >= 2) {
          setTimeout(() => {
            const systemMsg = "SYSTEM: The user is failing the flashcards on this topic. Interrupt the quiz immediately. Say 'I notice this is tripping you up. Let's step back.' Then, explain the concept again using a completely different, extremely simple ELI5 analogy.";
            handleSend(systemMsg);
          }, 400);
          return 0;
        }
        return newStreak;
      });
    } else {
      setForgotStreak(0);
    }
  };

  const mascot = getMascot(activeSubject);

  // ─── Quick action chips ─────────────────────────────────────────────────────
  const quickActions = [
    { label: "Give me a quiz", icon: BrainCircuit },
    { label: "Make flashcards", icon: Layers },
    { label: "Explain my weak spots", icon: TrendingUp },
    { label: "What should I study today?", icon: Sparkles },
  ];

  return (
    <div className="flex-grow flex-1 flex flex-col w-full h-full bg-[#fffdf9] dark:bg-[#0c0e17] text-foreground transition-colors duration-300 overflow-hidden relative select-none">

      {/* ── Subject Selector Header ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border-b-4 border-zinc-950 px-4 py-3.5 shrink-0 flex items-center justify-between z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border-2 border-zinc-950 animate-float shrink-0">
            <Image src={mascot} alt="Mascot" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <h1 className="text-xs font-black text-zinc-900 dark:text-white leading-none font-sans uppercase tracking-wider">
              Syllabus Buddy
            </h1>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest mt-1 block">
              Cognitive Study Coach
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={() => generateGreeting(true)}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all active:translate-y-[1px] cursor-pointer shadow-sm"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
          </button>
          <select
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            disabled={grindActive}
            className="text-xs font-black bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-950 border-b-4 border-b-zinc-950 text-zinc-850 dark:text-zinc-200 rounded-2xl px-3 py-1.5 focus:outline-none cursor-pointer transition-all active:translate-y-[1px] active:border-b-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grind Mode Controller ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 shrink-0 z-10 select-none">
        <div className={`border-2 border-b-4 border-zinc-950 rounded-[20px] p-3 shadow-md relative overflow-hidden transition-all duration-300 ${
          grindActive 
            ? "bg-red-50/40 dark:bg-red-950/15 border-red-500/30" 
            : "bg-white dark:bg-zinc-900 border-zinc-950"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block leading-none">
                  Grind Mode Focus
                </span>
                <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1 block">
                  Concentrate all study energy on a specific topic
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const nextActive = !grindActive;
                setGrindActive(nextActive);
                localStorage.setItem("milo_grind_mode_active", String(nextActive));
                if (nextActive) {
                  if (grindSubject) {
                    setActiveSubject(grindSubject);
                  }
                } else {
                  // Fallback to first subject in storage
                  const subs = getSubjectsFromStorage();
                  if (subs.length > 0) setActiveSubject(subs[0]);
                }
              }}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 border-zinc-950 shadow-sm transition-all active:translate-y-[1px] cursor-pointer ${
                grindActive 
                  ? "bg-red-500 hover:bg-red-400 text-white" 
                  : "bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-slate-200"
              }`}
            >
              {grindActive ? "Active" : "Disabled"}
            </button>
          </div>

          {/* If Grind Mode is active, show inputs */}
          {grindActive ? (
            <div className="mt-2.5 pt-2.5 border-t border-red-200/50 dark:border-red-950/20 flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-2.5 py-1 flex flex-col justify-center">
                  <span className="text-[7px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider block">Target Subject/Unit</span>
                  <input
                    value={grindSubject}
                    onChange={(e) => {
                      setGrindSubject(e.target.value);
                      localStorage.setItem("milo_grind_mode_subject", e.target.value);
                      setActiveSubject(e.target.value);
                    }}
                    className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 bg-transparent border-none focus:outline-none w-full p-0 mt-0.5"
                    placeholder="e.g. Human Anatomy I"
                  />
                </div>
                <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-855 rounded-xl px-2.5 py-1 flex flex-col justify-center">
                  <span className="text-[7px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider block">Target Topic</span>
                  <input
                    value={grindTopic}
                    onChange={(e) => {
                      setGrindTopic(e.target.value);
                      localStorage.setItem("milo_grind_mode_topic", e.target.value);
                    }}
                    className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 bg-transparent border-none focus:outline-none w-full p-0 mt-0.5"
                    placeholder="e.g. Cardiac Cycle"
                  />
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 flex items-center gap-1.5">
                <span className="text-[8px] font-black text-red-600 dark:text-red-400 leading-normal">
                  ⚠️ Milo Buddy is locked into training on this specific concept. All focus timer sessions will target this goal.
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-[8px] text-zinc-400 font-semibold flex items-center gap-1">
              <span>💡</span>
              <span>Enable to instruct Milo Buddy to ignore everything else and drill you on one custom unit and topic.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Buddy Memory Panel ──────────────────────────────────────────────── */}
      {pattern && pattern.totalSessions > 0 && (
        <div className="px-4 pt-3 shrink-0 z-10">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] overflow-hidden shadow-sm">
            <button
              onClick={() => setShowMemory(!showMemory)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-500 dark:text-[#14fac8]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Milo knows about you
                </span>
                <span className="bg-indigo-100 dark:bg-[#14fac8]/10 text-indigo-600 dark:text-[#14fac8] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-indigo-200 dark:border-[#14fac8]/20">
                  {pattern.totalSessions} sessions
                </span>
              </div>
              {showMemory
                ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {showMemory && (
              <div className="px-3.5 pb-3 grid grid-cols-2 gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                {/* Cognitive learning style profile highlight */}
                {focusCapacity && (
                  <div className="col-span-2 bg-[#fffdf9] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-inner">
                    <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider">
                      ★ Highlighted Learning Style Profile
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[8px] font-extrabold uppercase bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded border border-orange-200/50">
                        {focusCapacity}
                      </span>
                      <span className="text-[8px] font-extrabold uppercase bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded border border-yellow-200/50">
                        {energyRhythm}
                      </span>
                      <span className="text-[8px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200/50">
                        {processingStyle}
                      </span>
                      <span className="text-[8px] font-extrabold uppercase bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200/50">
                        {frictionType}
                      </span>
                    </div>
                  </div>
                )}
                {/* Overall mastery */}
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Avg Mastery</span>
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{pattern.overallMastery}/5</span>
                  </div>
                </div>
                {/* Focus quality */}
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Focus Score</span>
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{pattern.overallFocusQuality}/100</span>
                  </div>
                </div>
                {/* Streak */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Study Streak</span>
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{pattern.streakDays} days 🔥</span>
                  </div>
                </div>
                {/* Weakest subject */}
                {pattern.weakestSubjects.length > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Needs Work</span>
                      <span className="text-xs font-black text-red-500 dark:text-red-400 truncate block max-w-[80px]">{pattern.weakestSubjects[0].name}</span>
                    </div>
                  </div>
                )}
                {/* Neglected subjects warning */}
                {pattern.neglectedSubjects.length > 0 && (
                  <div className="col-span-2 bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                      {pattern.neglectedSubjects[0].name} not studied in {pattern.neglectedSubjects[0].daysSinceLastStudy} days — memory decay started
                    </span>
                  </div>
                )}
                {/* Per-subject mastery bars */}
                <div className="col-span-2 space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                  {pattern.subjectStats.filter(s => s.sessionsCount > 0).slice(0, 4).map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      {s.trend === "improving" && <TrendingUp className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                      {s.trend === "declining" && <TrendingDown className="w-2.5 h-2.5 text-red-400 shrink-0" />}
                      {(s.trend === "stable" || s.trend === "no-data") && <TrendMinus className="w-2.5 h-2.5 text-zinc-400 shrink-0" />}
                      <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 w-24 truncate shrink-0">{s.name}</span>
                      <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-[#14fac8] transition-all duration-700"
                          style={{ width: `${(s.avgMastery / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-zinc-600 dark:text-zinc-300 shrink-0">{s.avgMastery}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Chat Area ──────────────────────────────────────────────────────── */}
      <ScrollArea ref={scrollRef} className="flex-grow px-4 py-4 overflow-y-auto no-scrollbar z-0">
        <div className="space-y-5 pb-4">

          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <div key={m.id} className={`flex gap-2.5 animate-scale-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>

                {/* Avatar */}
                {!isUser ? (
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-b-4 border-zinc-950 shadow-md shrink-0 flex items-center justify-center p-1 self-end">
                    <Image src={mascot} alt="Milo" width={24} height={24} className="object-contain animate-float" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-b-4 border-zinc-950 shadow-md shrink-0 flex items-center justify-center text-[9px] font-black text-white self-end uppercase">
                    {(userName || "You").slice(0, 2)}
                  </div>
                )}

                <div className="flex flex-col space-y-2 max-w-[82%]">

                  {/* Chat bubble */}
                  {m.type === "chat" && m.content && (
                    <div className={`px-4 py-3 text-xs leading-relaxed font-semibold shadow-md rounded-[20px] ${
                      isUser
                        ? "bg-blue-600 border-2 border-zinc-950 border-b-4 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none border-2 border-b-4 border-zinc-950"
                    }`}>
                      {isUser ? m.content : <MiloMarkdown content={m.content} />}
                    </div>
                  )}

                  {/* Chat content accompanying a quiz, flashcards, analogy, or example block */}
                  {m.content && (m.type === "quiz" || m.type === "flashcards" || m.type === "analogy" || m.type === "example") && (
                    <div className="px-4 py-3 text-xs leading-relaxed font-semibold shadow-md rounded-[20px] bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none border-2 border-b-4 border-zinc-950 mb-1.5">
                      <MiloMarkdown content={m.content} />
                    </div>
                  )}

                  {/* Analogy Card */}
                  {m.type === "analogy" && m.analogy && (
                    <AnalogyCard
                      concept={m.analogy.concept}
                      analogy={m.analogy.analogy}
                    />
                  )}

                  {/* Example Snippet */}
                  {m.type === "example" && m.example && (
                    <ExampleSnippet
                      concept={m.example.concept}
                      code={m.example.codeOrBrief}
                      explanation={m.example.explanation}
                    />
                  )}

                  {/* Quiz card */}
                  {m.type === "quiz" && m.quiz && (
                    <div className="bg-white dark:bg-[#121214] border-2 border-zinc-950 border-b-4 rounded-[24px] p-4 shadow-lg max-w-sm w-full animate-scale-in">
                      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-emerald-600 dark:text-[#14fac8] uppercase mb-2.5">
                        <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                        ADAPTIVE QUIZ · {activeSubject}
                      </div>
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 leading-snug mb-3">
                        {m.quiz.question}
                      </h4>
                      <div className="space-y-2">
                        {m.quiz.options.map((opt, oIdx) => {
                          const answered = m.quiz!.userAnswer !== undefined;
                          const selected = m.quiz!.userAnswer === oIdx;
                          const isCorrect = opt.correct;

                          let style = "bg-slate-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800";
                          if (answered) {
                            if (selected && isCorrect) style = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-black";
                            else if (selected && !isCorrect) style = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400 font-black";
                            else if (isCorrect) style = "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-400/50 text-emerald-600/80";
                            else style = "opacity-40 bg-slate-50 dark:bg-zinc-900 border-zinc-200";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={answered}
                              onClick={() => handleAnswerQuiz(m.id, oIdx)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-2xl border-2 border-b-4 text-xs font-semibold transition-all flex items-center justify-between gap-2 active:translate-y-[2px] active:border-b-2 cursor-pointer ${style}`}
                            >
                              <span>{opt.text}</span>
                              {answered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />}
                              {answered && selected && !isCorrect && <X className="w-3.5 h-3.5 text-red-500 shrink-0 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                      {m.quiz.userAnswer !== undefined && (
                        <div className="mt-3 pt-3 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex gap-2 animate-slide-up">
                          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-[#14fac8] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#14fac8] block">Milo Explains:</span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">{m.quiz.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flashcard deck */}
                  {m.type === "flashcards" && m.flashcards && (
                    <div className="w-full max-w-sm animate-scale-in">
                      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-blue-600 dark:text-[#14fac8] uppercase mb-2.5">
                        <Layers className="w-3.5 h-3.5" />
                        FLASHCARDS · {activeSubject} · tap to flip
                      </div>
                      <div className="space-y-2.5">
                        {m.flashcards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleFlipCard(m.id, cIdx)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleFlipCard(m.id, cIdx);
                              }
                            }}
                            className="w-full text-left bg-white dark:bg-[#121214] border-2 border-zinc-950 border-b-4 rounded-2xl p-4 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {!card.flipped ? (
                                  <>
                                    <span className="text-[9px] font-black text-blue-500 dark:text-[#14fac8] uppercase tracking-wider block mb-1">Front</span>
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">{card.front}</p>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider block mb-1">Answer</span>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">{card.back}</p>
                                    
                                    {/* Rating component */}
                                    <div 
                                      className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-850 flex flex-col gap-1.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                        Rate recall (1 = Forgot, 5 = Easy):
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                          const isActive = card.rating !== undefined && card.rating >= star;
                                          return (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRateCard(m.id, cIdx, star);
                                              }}
                                              className="p-1 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/star"
                                              title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
                                            >
                                              <Star 
                                                className={`w-3.5 h-3.5 transition-all ${
                                                  isActive 
                                                    ? "text-amber-400 fill-amber-400 scale-110" 
                                                    : "text-zinc-300 dark:text-zinc-700 hover:text-amber-300 hover:scale-105"
                                                }`} 
                                              />
                                            </button>
                                          );
                                        })}
                                        {card.rating !== undefined && (
                                          <span className="text-[9px] font-black text-amber-500 ml-1 uppercase">
                                            {card.rating === 1 ? "Forgot" : card.rating === 2 ? "Hard" : card.rating === 3 ? "Medium" : card.rating === 4 ? "Good" : "Easy"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:rotate-180 transition-transform duration-300">
                                <RotateCcw className="w-3 h-3 text-zinc-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-b-4 border-zinc-950 shadow-md shrink-0 flex items-center justify-center p-1 self-end">
                <Image src={mascot} alt="Milo" width={24} height={24} className="object-contain animate-float" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] rounded-bl-none px-4 py-3.5 flex items-center gap-1.5 shadow-md self-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Quick action chips — show only when no conversation yet */}
          {messages.length <= 1 && !isLoading && (
            <div className="mt-2">
              <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(label)}
                    className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl px-3 py-2 text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Icon className="w-3 h-3 text-indigo-500 dark:text-[#14fac8]" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input Bar ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-24 bg-[#fffdf9] dark:bg-[#0c0e17] shrink-0 z-20">
        <div className="bg-white dark:bg-[#121214] border-2 border-zinc-950 border-b-4 shadow-lg rounded-[24px] p-2 flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder={`Ask ${activeSubject} question, say 'quiz' or 'flashcards'...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 h-9 font-semibold text-zinc-900 dark:text-zinc-150"
          />
          <button
            onClick={() => {
              const trimmed = input.trim();
              if (!trimmed) {
                if (grindActive && grindTopic) {
                  setInput(`Explain the core concepts of ${grindTopic} in ${grindSubject} with simple analogies`);
                  return;
                }
                const subLower = activeSubject.toLowerCase();
                let topic = "";
                if (subLower.includes("programming") || subLower.includes("computing") || subLower.includes("code") || subLower.includes("python")) {
                  topic = "Explain what recursion and stack frames mean in Python";
                } else if (subLower.includes("calculus") || subLower.includes("math") || subLower.includes("algebra")) {
                  topic = "Explain what continuous derivatives and integration limits mean";
                } else if (subLower.includes("economics") || subLower.includes("econ")) {
                  topic = "Explain what supply and demand equilibrium curves mean";
                } else if (subLower.includes("physics") || subLower.includes("phys")) {
                  topic = "Explain what Newton's third law of motion means";
                } else if (subLower.includes("chemistry") || subLower.includes("chem")) {
                  topic = "Explain what covalent molecular bonding means";
                } else {
                  topic = `Explain the core concepts and primary functions of ${activeSubject}`;
                }
                setInput(topic);
                return;
              }
              handleSend(`Explain this like I'm 5 (ELI5) with simple analogies: ${trimmed}`);
            }}
            disabled={isLoading}
            className="h-10 px-3 rounded-2xl bg-amber-400 border-2 border-zinc-950 border-b-4 border-b-amber-600 text-zinc-950 flex items-center justify-center gap-1.5 hover:bg-amber-350 active:border-b-0 active:translate-y-[4px] transition-all shadow-md cursor-pointer shrink-0 text-[10px] font-black uppercase"
            title="Explain Like I'm 5 (ELI5)"
          >
            <span>👶</span> ELI5
          </button>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-2xl bg-[#14fac8] border-2 border-zinc-950 border-b-4 border-b-[#0ca986] text-zinc-950 flex items-center justify-center hover:bg-[#1efdd0] active:border-b-0 active:translate-y-[4px] transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
            title="Send"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              : <Send className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
        <div className="flex items-center justify-center mt-2.5 gap-1.5 select-none">
          <BookOpen className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
          <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-wider">Cognitive Study partner · Enforcing active recall</span>
        </div>
      </div>

    </div>
  );
}
