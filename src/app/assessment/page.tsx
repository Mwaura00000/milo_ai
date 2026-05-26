"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Zap, Eye, RefreshCw, AlertCircle, Compass, Brain, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QuestionStep {
  key: "focus_capacity" | "energy_rhythm" | "processing_style" | "friction_type";
  title: string;
  question: string;
  mascotTip: string;
  icon: any;
  options: {
    value: string;
    label: string;
    description: string;
    icon: string;
  }[];
}

const QUESTIONS: QuestionStep[] = [
  {
    key: "focus_capacity",
    title: "Attention Style",
    question: "When you sit down to study, how does your brain naturally catch its wave?",
    mascotTip: "This helps me know how to structure your study intervals and timer breaks!",
    icon: Clock,
    options: [
      {
        value: "Sprinter <25m",
        label: "⚡ Sprint Mode",
        description: "I thrive in short, high-energy bursts. Keep focus sessions under 25 minutes.",
        icon: "⚡"
      },
      {
        value: "Deep Worker >60m",
        label: "🌊 Deep Flow",
        description: "Takes time to warm up, but once in the zone, I stay locked in for an hour or more.",
        icon: "🌊"
      }
    ]
  },
  {
    key: "energy_rhythm",
    title: "Energy Rhythm",
    question: "When does your mental engine feel like it has the highest horsepower?",
    mascotTip: "I will align your toughest schedule blocks with your natural biological peaks!",
    icon: Compass,
    options: [
      {
        value: "Morning Lark",
        label: "🌅 Morning Lark",
        description: "Early hours are my superpower. My mind is sharpest before the world wakes up.",
        icon: "🌅"
      },
      {
        value: "Night Owl",
        label: "🦉 Night Owl",
        description: "Midnight oil is my fuel. I study best when the room is quiet and the sun is down.",
        icon: "🦉"
      }
    ]
  },
  {
    key: "processing_style",
    title: "Mind Style",
    question: "When conquering a complex new subject, how does your mind digest it?",
    mascotTip: "I'll rewrite my explanations using the exact mental structure your brain loves!",
    icon: Brain,
    options: [
      {
        value: "Step-by-Step Builder",
        label: "🧱 Step-by-Step Builder",
        description: "Give me linear progressions, clear steps, and highly structured logical lists.",
        icon: "🧱"
      },
      {
        value: "Big Picture Visionary",
        label: "🎨 Big Picture Visionary",
        description: "Give me high-level analogies, mental frameworks, and the Feynman technique first.",
        icon: "🎨"
      }
    ]
  },
  {
    key: "friction_type",
    title: "Momentum Threat",
    question: "What is the biggest threat that breaks your study momentum?",
    mascotTip: "I will use active coaching strategies to counter this exact distraction or freeze!",
    icon: ShieldAlert,
    options: [
      {
        value: "Easily Distracted",
        label: "📱 Shiny Objects",
        description: "A single notification or passing thought pulls me completely out of focus.",
        icon: "📱"
      },
      {
        value: "Easily Overwhelmed",
        label: "❄️ Mental Freeze",
        description: "If a topic is too massive or complex, my brain gets paralyzed and I procrastinate.",
        icon: "❄️"
      }
    ]
  }
];

export default function CognitiveAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRetake, setIsRetake] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Check if we are retaking
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "retake") {
        setIsRetake(true);
      }
    }
  }, []);

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
      // Fetch user to match profile id
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "mock-user-uuid-123456";

      // Save to Supabase (absorbs database schema mismatch issues gracefully)
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            focus_capacity: selections.focus_capacity,
            energy_rhythm: selections.energy_rhythm,
            processing_style: selections.processing_style,
            friction_type: selections.friction_type
          })
          .eq("id", userId);

        if (error) {
          console.warn("Supabase database save failed (possibly pending migrations). Using local storage fallback:", error.message);
        }
      } catch (dbErr: any) {
        console.warn("Resilient database fallback active:", dbErr?.message || dbErr);
      }

      // Explicitly set in localStorage to guarantee sync for both live & mock fallback
      localStorage.setItem("milo_focus_capacity", selections.focus_capacity);
      localStorage.setItem("milo_energy_rhythm", selections.energy_rhythm);
      localStorage.setItem("milo_processing_style", selections.processing_style);
      localStorage.setItem("milo_friction_type", selections.friction_type);
      localStorage.setItem("milo_assessment_completed", "true");

      setShowSummary(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const selectedValue = selections[currentQuestion.key];
  const StepIcon = currentQuestion.icon;

  // Compute cognitive persona & study method recommendations
  const getCognitiveProfileDetails = () => {
    const focus = selections.focus_capacity || "Sprinter <25m";
    const rhythm = selections.energy_rhythm || "Morning Lark";
    const style = selections.processing_style || "Step-by-Step Builder";
    const friction = selections.friction_type || "Easily Distracted";

    let personaName = "The Sunrise Sprinter 🌅⚡";
    if (focus === "Sprinter <25m" && rhythm === "Night Owl") {
      personaName = "The Midnight Rocket 🦉⚡";
    } else if (focus === "Deep Worker >60m" && rhythm === "Morning Lark") {
      personaName = "The Early Deep Diver 🌅🌊";
    } else if (focus === "Deep Worker >60m" && rhythm === "Night Owl") {
      personaName = "The Midnight Deep Diver 🦉🌊";
    }

    let recommendedMethod = "Pomodoro + Active Recall Drill";
    let methodDescription = "Study in 25-minute bursts with zero phone distraction, followed by rapid active recall tests from Milo. Explains massive modules linearly to keep your brain step-by-step in the game.";
    
    if (style === "Big Picture Visionary" && friction === "Easily Distracted") {
      recommendedMethod = "Feynman Analogy Drill";
      methodDescription = "Understand the entire blueprint first using real-world analogies. Milo will keep lectures strictly short (under 2 sentences) and dynamically quiz you to block out distraction.";
    } else if (style === "Step-by-Step Builder" && friction === "Easily Overwhelmed") {
      recommendedMethod = "Incremental Chunking";
      methodDescription = "We break massive subjects into micro-lessons. Milo guides you step-by-step, checking your understanding at every single logical node so you never experience brain freeze.";
    } else if (style === "Big Picture Visionary" && friction === "Easily Overwhelmed") {
      recommendedMethod = "Socratic Feynman Method";
      methodDescription = "Milo will act as a strict Socratic tutor. Instead of giving direct homework answers, he'll guide you step-by-step to discover them yourself using high-level concepts and analogies.";
    }

    return { personaName, recommendedMethod, methodDescription };
  };

  const profile = getCognitiveProfileDetails();

  if (showSummary) {
    return (
      <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
        {/* Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        {/* Mascot bubble */}
        <div className="w-full max-w-lg flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-4 shadow-md mb-6 mt-6 z-10 select-none">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
            <Image src="/milo_mascot.png" alt="Milo Assistant" width={40} height={40} className="object-contain" />
          </div>
          <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
            <span className="text-blue-600 dark:text-[#14fac8] block uppercase tracking-wider mb-0.5">Milo Insights:</span>
            "Fascinating! I have analyzed your cognitive profile. Here is how your mind works and how we will crush your syllabus together!"
          </div>
        </div>

        {/* Main Summary Card */}
        <main className="w-full max-w-lg z-10 animate-scale-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-500">
                <Brain className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider block">Cognitive Persona</span>
                <span className="text-base font-extrabold text-zinc-950 dark:text-white leading-none">
                  {profile.personaName}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider block mb-1">
                  ★ Recommended Method
                </span>
                <h3 className="text-base font-black text-zinc-950 dark:text-white mb-2">
                  {profile.recommendedMethod}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-bold">
                  {profile.methodDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Attention Style</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections.focus_capacity}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Engine Peak</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections.energy_rhythm}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Mind digesting</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections.processing_style}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-0.5">Study Risk</span>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">{selections.friction_type}</span>
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

        <footer className="mt-8 text-[10px] text-zinc-400 font-bold select-none text-center">
          Tailored using cognitive science. Let&apos;s crush it!
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-orange-500/5 dark:bg-amber-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/5 dark:bg-violet-600/15 blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-lg flex items-center justify-between py-5 z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-all active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer"
            title="Back"
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
          <span className="text-amber-500">★</span> Step {currentStep + 1} of {QUESTIONS.length}
        </div>
      </header>

      {/* Mascot speech bubble */}
      <div className="w-full max-w-lg flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-3 shadow-md mb-6 z-10 select-none">
        <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-wiggle shadow-inner">
          <Image src="/milo_mascot.png" alt="Milo Assistant" width={36} height={36} className="object-contain" />
        </div>
        <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {currentQuestion.mascotTip}
        </div>
      </div>

      {/* Main card */}
      <main className="w-full max-w-lg z-10">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          
          {/* Progress bar */}
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-950 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Animated slider container */}
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
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-500 text-red-650 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            {/* Action footer */}
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
