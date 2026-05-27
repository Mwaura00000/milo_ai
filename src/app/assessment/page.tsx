"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Target, BookOpen, PenTool, Lightbulb, AlertCircle, Clock, MapPin, Heart, Zap, Compass, Brain, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QuestionStep {
  key: string;
  title: string;
  question: string;
  mascotTip: string;
  icon: any;
  hasDatePicker?: boolean;
  options: {
    value: string;
    label: string;
    description: string;
    icon: string;
  }[];
}

const QUESTIONS: QuestionStep[] = [
  {
    key: "milo_goal",
    title: "Primary Goal",
    question: "What is your main goal for studying right now?",
    mascotTip: "Knowing your target helps me set the urgency and depth of our sessions!",
    icon: Target,
    options: [
      { value: "exam-cram", label: "Exam Cram", description: "I have an exam in less than 3 weeks", icon: "🔥" },
      { value: "long-term-mastery", label: "Deep Mastery", description: "I want to deeply master a subject long-term", icon: "🧠" },
      { value: "skill-performance", label: "Practical Skill", description: "I need to perform a practical skill (e.g., lab, clinical)", icon: "🔬" },
      { value: "project-deadline", label: "Project Deadline", description: "I have a specific project or assignment deadline", icon: "📅" }
    ]
  },
  {
    key: "milo_prior_knowledge",
    title: "Prior Knowledge",
    question: "How familiar are you already with this subject?",
    mascotTip: "This tells me whether to start with fundamentals or jump into advanced details.",
    icon: BookOpen,
    options: [
      { value: "beginner", label: "Complete Beginner", description: "Everything is new", icon: "🌱" },
      { value: "some-exposure", label: "Some Exposure", description: "I've had some exposure but still shaky", icon: "🌿" },
      { value: "intermediate", label: "Intermediate", description: "I know a fair amount", icon: "🌳" },
      { value: "advanced", label: "Advanced", description: "I'm building on strong foundations", icon: "🌲" }
    ]
  },
  {
    key: "milo_dominant_habit",
    title: "Study Habit",
    question: "When you sit down to study, what do you do most often?",
    mascotTip: "Your current habit is my baseline to figure out what strategies we should add.",
    icon: PenTool,
    options: [
      { value: "re-read/highlight", label: "Re-read / Highlight", description: "Re-read or highlight my notes/textbook", icon: "🖍️" },
      { value: "summarise", label: "Summarise", description: "Summarise the material in my own words", icon: "📝" },
      { value: "self-test", label: "Self-Test", description: "Test myself with flashcards or past papers", icon: "🃏" },
      { value: "discuss/teach", label: "Discuss / Teach", description: "Discuss the topic with someone or try to teach it", icon: "🗣️" },
      { value: "passive", label: "Passive Consumption", description: "Watch videos or read without writing/speaking", icon: "📺" },
      { value: "mix", label: "Mixed Methods", description: "I mix different methods", icon: "🔀" }
    ]
  },
  {
    key: "milo_metacognition",
    title: "Self-Awareness",
    question: "After studying, how accurately can you predict what you'll remember the next day?",
    mascotTip: "This is called metacognition! It tells me if we need more active recall testing.",
    icon: Lightbulb,
    options: [
      { value: "well-calibrated", label: "Very Accurately", description: "I know exactly what I know and what I'm shaky on", icon: "🎯" },
      { value: "moderately-calibrated", label: "Somewhat", description: "I can make a rough guess", icon: "⚖️" },
      { value: "poorly-calibrated", label: "Not at all", description: "I'm often surprised by what I forget", icon: "🤷" }
    ]
  },
  {
    key: "milo_challenge",
    title: "Biggest Struggle",
    question: "What is your single biggest obstacle when it comes to studying?",
    mascotTip: "I'll use active coaching to counter this exact distraction or freeze!",
    icon: AlertCircle,
    options: [
      { value: "concentration", label: "Scattered Focus", description: "I can't stay focused; my mind wanders", icon: "🌪️" },
      { value: "motivation", label: "Low Motivation", description: "I keep putting it off; motivation is low", icon: "🛋️" },
      { value: "understanding", label: "Understanding Concepts", description: "I don't understand, no matter how much I read", icon: "🧩" },
      { value: "forgetting", label: "Forgetting", description: "I understand at the time but forget quickly", icon: "👻" },
      { value: "time-management", label: "Time Management", description: "I never have enough time; I'm always racing", icon: "⏱️" },
      { value: "test-anxiety", label: "Test Anxiety", description: "I get very anxious or panicky around tests", icon: "😰" }
    ]
  },
  {
    key: "milo_hours_per_week",
    title: "Time Availability",
    question: "How many hours per week can you realistically dedicate to this subject?",
    mascotTip: "Set a realistic baseline. Note your deadline below as well!",
    icon: Clock,
    hasDatePicker: true,
    options: [
      { value: "0-5", label: "0 - 5 Hours", description: "A light load, requires high efficiency", icon: "🕰️" },
      { value: "6-10", label: "6 - 10 Hours", description: "Moderate, steady pacing", icon: "⏳" },
      { value: "11-20", label: "11 - 20 Hours", description: "Heavy commitment", icon: "⚙️" },
      { value: "irregular", label: "Irregular", description: "My schedule changes constantly", icon: "🎢" }
    ]
  },
  {
    key: "milo_environment",
    title: "Study Environment",
    question: "Where do you usually study, and how distracting is it?",
    mascotTip: "Your environment shapes your focus. Let's map it out.",
    icon: MapPin,
    options: [
      { value: "quiet", label: "Quiet Space", description: "Dedicated space (library, home office). Low distraction.", icon: "🤫" },
      { value: "somewhat-noisy", label: "Somewhat Noisy", description: "Home with people, café. Medium distraction.", icon: "☕" },
      { value: "on-the-go", label: "On the Go", description: "Online only / travelling. High distraction.", icon: "🏃" }
    ]
  },
  {
    key: "milo_motivation",
    title: "Motivation",
    question: "What is driving you to learn this?",
    mascotTip: "Understanding your 'why' helps me tailor my encouragement for you!",
    icon: Heart,
    options: [
      { value: "intrinsic", label: "Genuine Interest", description: "I'm genuinely interested in the topic", icon: "❤️" },
      { value: "career", label: "Career Necessity", description: "I need it for my future career", icon: "💼" },
      { value: "external-pressure", label: "External Expectation", description: "My family or others expect it of me", icon: "👨‍👩‍👧" },
      { value: "fear-of-failure", label: "Fear of Failing", description: "I'm afraid of failing or being left behind", icon: "😨" },
      { value: "competitive", label: "Competitive Drive", description: "I want to be at the top", icon: "🏆" }
    ]
  },
  {
    key: "milo_focus_capacity",
    title: "Focus Style",
    question: "How do you focus best?",
    mascotTip: "This helps me know how to structure your study intervals and timer breaks!",
    icon: Zap,
    options: [
      { value: "sprint", label: "Sprint Runner", description: "Short, intense bursts (20-30 minutes)", icon: "⚡" },
      { value: "marathon", label: "Marathon Cruiser", description: "Long, steady blocks (1-2+ hours)", icon: "🌊" }
    ]
  },
  {
    key: "milo_energy_rhythm",
    title: "Peak Energy",
    question: "When do you feel most alert and productive?",
    mascotTip: "I will align your toughest schedule blocks with your natural biological peaks!",
    icon: Compass,
    options: [
      { value: "morning", label: "Morning", description: "Early hours are my superpower", icon: "🌅" },
      { value: "afternoon", label: "Afternoon", description: "I peak in the middle of the day", icon: "☀️" },
      { value: "night", label: "Night", description: "Midnight oil is my fuel", icon: "🦉" }
    ]
  },
  {
    key: "milo_processing_style",
    title: "Processing Preference",
    question: "When learning something new, do you prefer:",
    mascotTip: "I'll rewrite my explanations using the exact mental structure your brain loves!",
    icon: Brain,
    options: [
      { value: "step-by-step", label: "Step-by-Step Builder", description: "Step-by-step details first, building up piece by piece", icon: "🧱" },
      { value: "big-picture", label: "Big Picture Visionary", description: "The big picture first – an overview or analogy before diving in", icon: "🎨" }
    ]
  }
];

export default function CognitiveAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [deadlineInput, setDeadlineInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const handleSelect = (value: string) => {
    const currentQuestion = QUESTIONS[currentStep];
    setSelections(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = QUESTIONS[currentStep];
    if (!selections[currentQuestion.key]) return;

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "mock-user-uuid-123456";

      // Save to Supabase gracefully
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            focus_capacity: selections["milo_focus_capacity"],
            energy_rhythm: selections["milo_energy_rhythm"],
            processing_style: selections["milo_processing_style"],
            friction_type: selections["milo_challenge"]
          })
          .eq("id", userId);

        if (error) {
          console.warn("Supabase database save failed. Using local storage fallback:", error.message);
        }
      } catch (dbErr: any) {
        console.warn("Resilient database fallback active:", dbErr?.message || dbErr);
      }

      // Explicitly set in localStorage all 11 properties
      Object.entries(selections).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      localStorage.setItem("milo_deadline", deadlineInput || "no deadline");
      localStorage.setItem("milo_assessment_completed", "true");
      
      // Also set the old keys that components expect
      localStorage.setItem("milo_focus_capacity", selections["milo_focus_capacity"]);
      localStorage.setItem("milo_energy_rhythm", selections["milo_energy_rhythm"]);
      localStorage.setItem("milo_processing_style", selections["milo_processing_style"]);
      localStorage.setItem("milo_friction_type", selections["milo_challenge"]);
      localStorage.setItem("milo_chat_diagnostic_completed", "true");

      setShowSummary(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCognitiveProfileDetails = () => {
    const habit = selections["milo_dominant_habit"] || "passive";
    const meta = selections["milo_metacognition"] || "poorly-calibrated";
    const prior = selections["milo_prior_knowledge"] || "beginner";
    const goal = selections["milo_goal"] || "exam-cram";
    const friction = selections["milo_challenge"] || "concentration";
    const motivation = selections["milo_motivation"] || "intrinsic";
    const rhythm = selections["milo_energy_rhythm"] || "morning";
    const focus = selections["milo_focus_capacity"] || "sprint";

    // Descriptor 1
    let d1 = "Passive Consumer";
    if (habit === "re-read/highlight") {
      d1 = meta === "poorly-calibrated" ? "Unaware Re-reader" : "Conscious Re-reader";
    } else if (habit === "summarise") {
      d1 = meta === "poorly-calibrated" ? "Diligent but Drifting" : "Structured Summariser";
    } else if (habit === "self-test") {
      d1 = meta === "poorly-calibrated" ? "Uncertain Self-tester" : "Strategic Self-tester";
    } else if (habit === "discuss/teach") {
      d1 = "Collaborative Explainer";
    } else if (habit === "mix") {
      d1 = "Flexible Multimodal";
    }

    // Descriptor 2
    let d2 = "Curious Beginner";
    if (prior === "beginner") {
      if (goal === "exam-cram") d2 = "Beginner on a Deadline";
      else if (goal === "long-term-mastery") d2 = "Curious Beginner";
      else if (goal === "skill-performance") d2 = "Hands-on Novice";
      else if (goal === "project-deadline") d2 = "Beginner with a Mission";
    } else if (prior === "some-exposure") {
      if (goal === "exam-cram") d2 = "Rusty Crammer";
      else if (goal === "long-term-mastery") d2 = "Emerging Explorer";
      else if (goal === "skill-performance") d2 = "Practicing Apprentice";
      else if (goal === "project-deadline") d2 = "Dusting Off the Basics";
    } else if (prior === "intermediate") {
      if (goal === "exam-cram") d2 = "Polishing Pro";
      else if (goal === "long-term-mastery") d2 = "Refining Practitioner";
      else if (goal === "skill-performance") d2 = "Sharpening the Blade";
      else if (goal === "project-deadline") d2 = "Efficient Executor";
    } else if (prior === "advanced") {
      if (goal === "exam-cram") d2 = "Master under Pressure";
      else if (goal === "long-term-mastery") d2 = "Deepening Expert";
      else if (goal === "skill-performance") d2 = "Expert Performer";
      else if (goal === "project-deadline") d2 = "Seasoned Finisher";
    }

    // Descriptor 3
    let d3 = "seeking Clarity";
    if (friction === "concentration") d3 = "with Scattered Focus";
    else if (friction === "motivation") d3 = "battling the Pause Button";
    else if (friction === "understanding") d3 = "seeking Clarity";
    else if (friction === "forgetting") d3 = "fighting the Forgetting Curve";
    else if (friction === "time-management") d3 = "racing the Clock";
    else if (friction === "test-anxiety") d3 = "calming the Storm";

    // Modifiers
    let prefix = "The";
    if (motivation === "fear-of-failure") prefix = "The Anxious";
    
    let suffix = "";
    if (rhythm === "night") suffix += " (Night Owl)";
    if (focus === "sprint") suffix += " (Sprint Runner)";

    const personaName = `${prefix} ${d1} ${d2} ${d3}${suffix}`;

    // Generate Strategies
    let strategies = [];
    if (d1.includes("Re-reader") || d1.includes("Passive")) {
      strategies.push("Replace re-reading with active retrieval practice (flashcards, self-quizzing).");
    }
    if (meta === "poorly-calibrated") {
      strategies.push("Use 'predict your score before checking' exercises and frequent low-stakes testing to improve metacognition.");
    }
    if (prior === "beginner") {
      strategies.push("Rely on worked examples, scaffolding, and step-by-step guidance before tackling complex problems.");
    } else if (prior === "advanced") {
      strategies.push("Use interleaving, varied problem sets, and generation attempts to deepen expertise.");
    }
    if (friction === "forgetting") {
      strategies.push("Implement a spaced repetition schedule (SM-2 intervals) to fight the forgetting curve.");
    } else if (friction === "understanding") {
      strategies.push("Use elaborative interrogation, analogies, and dual coding to break down tough concepts.");
    } else if (friction === "concentration") {
      strategies.push("Establish phone-free zones, use noise-cancelling tech, and try the '5-minute rule' to build momentum.");
    } else if (friction === "motivation") {
      strategies.push("Use implementation intentions ('I will study X at Y place at Z time') and tiny habits to overcome the pause button.");
    } else if (friction === "test-anxiety") {
      strategies.push("Practice box breathing, positive self-talk, and gradual exposure to exam-style conditions.");
    }
    
    if (strategies.length === 0) {
      strategies.push("Adopt the Pomodoro technique and mix subjects to maintain high mental elasticity.");
    }

    return { personaName, strategies: strategies.slice(0, 3) };
  };

  const currentQuestion = QUESTIONS[currentStep];
  const selectedValue = selections[currentQuestion.key];
  const StepIcon = currentQuestion.icon;
  const profile = getCognitiveProfileDetails();

  if (showSummary) {
    return (
      <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-4 shadow-md mb-6 mt-6 z-10 select-none">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
            <Image src="/milo_mascot.png" alt="Milo Assistant" width={40} height={40} className="object-contain" />
          </div>
          <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            <span className="text-blue-600 dark:text-[#14fac8] block uppercase tracking-wider mb-0.5">Milo Insights:</span>
            "Fascinating! I have analyzed your 11 cognitive dimensions. Here is your unique learning profile and how we will crush your syllabus together!"
          </div>
        </div>

        <main className="w-full max-w-lg z-10 animate-scale-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-500">
                <Brain className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider block">Cognitive Persona Label</span>
                <span className="text-sm md:text-base font-extrabold text-zinc-950 dark:text-white leading-tight block mt-1">
                  {profile.personaName}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider block mb-2">
                  ★ Core Prescribed Strategies
                </span>
                <ul className="space-y-3">
                  {profile.strategies.map((strategy, idx) => (
                    <li key={idx} className="flex gap-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-bold">
                      <span className="text-emerald-500 mt-0.5">✔</span> {strategy}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left mt-4">
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Focus Style</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections["milo_focus_capacity"]}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Energy Peak</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections["milo_energy_rhythm"]}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 border-2 border-b-6 border-zinc-950 text-xs font-black text-zinc-950 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                Let&apos;s Enter Dashboard! 🚀
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-orange-500/5 dark:bg-amber-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/5 dark:bg-violet-600/15 blur-[100px] pointer-events-none" />

      <header className="w-full max-w-lg flex items-center justify-between py-5 z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-all active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3.5]" />
          </button>
          
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-zinc-950">
              <Image src="/milo_mascot.png" alt="Milo Owl" width={22} height={22} className="object-contain" />
            </div>
            <span className="text-base font-black text-zinc-900 dark:text-white">
              Milo Coach
            </span>
          </div>
        </div>
        
        <div className="text-[10px] font-black bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-2xl uppercase tracking-wider shadow-sm flex items-center gap-1">
          <span className="text-amber-500">★</span> Q{currentStep + 1} / {QUESTIONS.length}
        </div>
      </header>

      <div className="w-full max-w-lg flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-3 shadow-md mb-6 z-10 select-none">
        <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-wiggle shadow-inner">
          <Image src="/milo_mascot.png" alt="Milo Assistant" width={36} height={36} className="object-contain" />
        </div>
        <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {currentQuestion.mascotTip}
        </div>
      </div>

      <main className="w-full max-w-lg z-10">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-950 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="min-h-[300px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500 text-amber-500">
                    <StepIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs uppercase font-black text-amber-600 tracking-wider">
                    {currentQuestion.title}
                  </span>
                </div>

                <h1 className="text-lg md:text-xl font-extrabold text-zinc-950 dark:text-white leading-snug mb-6">
                  {currentQuestion.question}
                </h1>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map(option => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full text-left p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 flex items-start gap-4 select-none relative active:translate-y-[2px] active:border-b-2 ${
                          isSelected
                            ? "bg-amber-50 border-amber-500 border-b-6 border-zinc-950 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
                            : "bg-white dark:bg-zinc-800 border-zinc-200 border-b-4 border-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200"
                        } cursor-pointer`}
                      >
                        <span className="text-2xl mt-0.5 select-none">{option.icon}</span>
                        <div className="flex-1">
                          <div className="font-extrabold text-sm md:text-base mb-1">
                            {option.label}
                          </div>
                          <div className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                            {option.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 border border-zinc-950 flex items-center justify-center animate-pop-in">
                            <Check className="w-3.5 h-3.5 stroke-[4.5]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {currentQuestion.hasDatePicker && (
                  <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Any specific deadline or exam date? (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Nov 2025 or 'No deadline'"
                      value={deadlineInput}
                      onChange={(e) => setDeadlineInput(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-zinc-900 dark:text-white"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500 text-red-650 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            <div className="mt-8 flex justify-between items-center gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 text-xs font-black text-zinc-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 shadow-sm transition-all cursor-pointer"
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedValue || isLoading}
                className={`px-6 py-3 rounded-2xl border-2 border-b-4 border-zinc-950 text-xs font-black flex items-center gap-2 shadow-sm transition-all ${
                  selectedValue && !isLoading
                    ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 cursor-pointer"
                    : "bg-zinc-150 border-zinc-300 text-zinc-450 dark:bg-zinc-800 dark:border-zinc-850 dark:text-zinc-650 opacity-60 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : currentStep === QUESTIONS.length - 1 ? (
                  <>
                    Complete <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </>
                ) : (
                  <>
                    Next Step <ArrowRight className="w-3.5 h-3.5 stroke-[3.5]" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>

      <footer className="mt-8 text-[10px] text-zinc-400 font-bold select-none text-center">
        Milo Coach is tailored using your cognitive biology. Enjoy learning!
      </footer>
    </div>
  );
}
