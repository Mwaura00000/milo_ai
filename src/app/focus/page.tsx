"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, AlertCircle, RotateCcw, Sparkles, Star, Plus, Minus, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FocusPage() {
  const router = useRouter();
  
  // Dynamic subject loading
  const [subject, setSubject] = useState("Mathematics");
  const [mascot, setMascot] = useState("/calculator_mascot.png");
  const [accentColor, setAccentColor] = useState("text-[#f85c5c]");

  // Grind Mode states
  const [grindActive, setGrindActive] = useState(false);
  const [grindTopic, setGrindTopic] = useState("");

  useEffect(() => {
    const grindModeActive = localStorage.getItem("milo_grind_mode_active") === "true";
    const grindModeSub = localStorage.getItem("milo_grind_mode_subject") || "";
    const grindModeTop = localStorage.getItem("milo_grind_mode_topic") || "";

    setGrindActive(grindModeActive);
    setGrindTopic(grindModeTop);

    let active = "";
    if (grindModeActive && grindModeSub) {
      active = grindModeSub;
    } else {
      active = localStorage.getItem("active_focus_subject") || "";
      if (!active) {
        const savedList = localStorage.getItem("milo_active_subjects");
        if (savedList) {
          const list = JSON.parse(savedList) as string[];
          if (list.length > 0) active = list[0];
        }
      }
    }

    if (active) {
      setSubject(active);
      const name = active.trim().toLowerCase();
      
      if (name.includes("programming") || name.includes("computing") || name.includes("software")) {
        setMascot("/calculator_mascot.png");
        setAccentColor("text-blue-600 dark:text-blue-450");
      } else if (name.includes("calculus") || name.includes("math")) {
        setMascot("/calculator_mascot.png");
        setAccentColor("text-red-500 dark:text-red-400");
      } else if (name.includes("economics") || name.includes("econ")) {
        setMascot("/earth_mascot.png");
        setAccentColor("text-emerald-600 dark:text-emerald-450");
      } else if (name.includes("communication") || name.includes("skills")) {
        setMascot("/milo_mascot.png");
        setAccentColor("text-purple-650 dark:text-purple-400");
      } else {
        setMascot("/milo_mascot.png");
        setAccentColor("text-indigo-600 dark:text-indigo-400");
      }
    }
  }, []);

  // Timer states
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [masteryRating, setMasteryRating] = useState(4);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
    setInterruptions(0);
  };

  const handleSessionComplete = () => {
    setShowLogModal(true);
  };

  const handleLogSession = async () => {
    const activeMinutes = Math.max(1, Math.round((durationMinutes * 60 - timeLeft) / 60));
    
    const sessionData = {
      subject,
      duration: durationMinutes,
      actualMinutes: activeMinutes,
      interruptions,
      mastery: masteryRating,
      timestamp: new Date().toISOString()
    };
    
    try {
      await supabase.from("study_sessions").insert({
        duration_minutes: activeMinutes,
        interruptions_count: interruptions,
        mastery_rating: masteryRating,
        created_at: sessionData.timestamp
      });
      
      const existing = JSON.parse(localStorage.getItem("study_sessions") || "[]");
      localStorage.setItem("study_sessions", JSON.stringify([...existing, sessionData]));
    } catch (e) {
      console.error("Session telemetry log error:", e);
    }
    
    setShowLogModal(false);
    handleReset();
    router.push("/insights");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  let strokeColor = "#8b5cf6"; 
  const nameLower = subject.toLowerCase();
  if (nameLower.includes("programming") || nameLower.includes("computing")) strokeColor = "#2563eb";
  else if (nameLower.includes("calculus") || nameLower.includes("math")) strokeColor = "#dc2626";
  else if (nameLower.includes("economics") || nameLower.includes("econ")) strokeColor = "#059669";

  return (
    <div className="flex flex-col h-full dot-grid-bg-light dark:dot-grid-bg bg-[#fffdf9] dark:bg-[#0c0e17] text-foreground transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">
      
      {/* Title */}
      <div className="px-6 pt-8 shrink-0 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-all active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer animate-scale-in"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3.5]" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none text-slate-800 dark:text-zinc-50 font-heading">Focus Timer</h1>
            <div className="flex flex-col gap-1 mt-1.5 select-none">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-none">
                Active Subject: <span className={accentColor}>{subject}</span>
              </p>
              {grindActive && (
                <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">
                  🎯 Focus Target: Master {grindTopic || "Custom Topic"}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-250 dark:border-amber-450 px-2.5 py-1.5 rounded-full animate-pulse-glow shadow-sm select-none">
          <Sparkles className="w-3 h-3" strokeWidth={3} />
          POMODORO
        </div>
      </div>

      {/* Mascot Speech Bubble Guidance (Mascot Integration) */}
      <div className="px-6 mt-6 shrink-0 select-none animate-scale-in z-10">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[24px] p-3 shadow-md relative">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
            <Image src="/milo_mascot.png" alt="Milo focus coach" width={40} height={40} className="object-contain" />
          </div>
          <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span className="text-amber-600 dark:text-amber-400 block uppercase tracking-wider mb-0.5">Milo Coach:</span>
            {grindActive ? (
              !isRunning 
                ? `🔥 Grind Mode study block! Let's lock in and master "${grindTopic}" in "${subject}". Tap Start to begin!`
                : `Concentrate deeply on "${grindTopic}"! Keep your mind clear, avoid phone pick-ups, and let's master this concept. Sawa?`
            ) : (
              !isRunning 
                ? `Ready to study ${subject}? Adjust the study interval below and tap Start. Milo will capture your telemetry log!` 
                : "Study session in progress! Put your phone away and avoid distractions to score a perfect 5-star comprehension rating!"
            )}
          </div>
        </div>
      </div>

      {/* Main Focus Console */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center space-y-10 my-4 z-10">
        
        {/* Glowing Circle Timer Container */}
        <div className="relative w-64 h-64 flex items-center justify-center animate-scale-in select-none">
          
          <div className="absolute inset-0 rounded-full border-4 border-zinc-950 shadow-inner bg-white/40 dark:bg-zinc-950/20" />
          
          <svg className="w-64 h-64 -rotate-90 absolute z-10" viewBox="0 0 172 172">
            <circle
              cx="86"
              cy="86"
              r="76"
              stroke="#e4e4e7"
              strokeWidth="9"
              className="dark:stroke-zinc-800"
              fill="transparent"
            />
            <circle
              className="transition-all duration-300"
              cx="86"
              cy="86"
              r="76"
              stroke={strokeColor}
              strokeWidth="9"
              fill="transparent"
              strokeDasharray="478"
              strokeDashoffset={478 - (478 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Central mascot & countdown */}
          <div className="absolute z-20 flex flex-col items-center text-center">
            
            {/* Mascot circular sticker */}
            <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 p-3.5 shadow-md border-2 border-zinc-950 border-b-6 border-b-zinc-950 flex items-center justify-center relative overflow-hidden mb-2 group hover:rotate-6 active:-rotate-6 transition-all duration-350 select-none">
              <Image 
                src={mascot} 
                alt="Subject Mascot" 
                width={64} 
                height={64} 
                className="object-contain animate-float"
              />
            </div>

            <span className="text-4xl font-black tracking-tight tabular-nums font-mono leading-none text-zinc-850 dark:text-white mt-1">
              {formatTime(timeLeft)}
            </span>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest mt-1.5">{subject}</p>
          </div>
        </div>

        {/* Duration Adjust with 3D tactile buttons */}
        {!isRunning && (
          <div className="w-full max-w-xs bg-zinc-900 border-2 border-zinc-950 border-b-6 border-b-zinc-950 rounded-[28px] p-3.5 flex items-center justify-between shadow-md text-white animate-scale-in select-none">
            <button 
              onClick={() => setDurationMinutes(prev => Math.max(5, prev - 5))}
              className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 border-b-4 border-b-zinc-950 active:border-b-0 active:translate-y-[4px] flex items-center justify-center transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4 text-zinc-350 stroke-[3.5]" />
            </button>
            <div className="text-center font-bold">
              <span className="text-[9px] text-zinc-500 font-black block uppercase tracking-wider">Set Interval</span>
              <span className="text-lg font-black text-[#14fac8]">{durationMinutes} min</span>
            </div>
            <button 
              onClick={() => setDurationMinutes(prev => Math.min(60, prev + 5))}
              className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 border-b-4 border-b-zinc-950 active:border-b-0 active:translate-y-[4px] flex items-center justify-center transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-zinc-355 stroke-[3.5]" />
            </button>
          </div>
        )}

        {/* Controls with tactile border depth */}
        <div className="w-full max-w-xs space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartPause}
              className={`flex-1 h-14 rounded-2xl font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                isRunning 
                  ? "bg-zinc-905 border-2 border-zinc-950 border-b-6 border-b-zinc-950 active:border-b-2 active:translate-y-[4px] text-amber-400" 
                  : "bg-[#14fac8] hover:bg-[#1efdd0] border-2 border-zinc-950 border-b-6 border-b-[#0ca986] text-zinc-950 active:border-b-2 active:translate-y-[4px]"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 stroke-[3]" /> Pause Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-950 border-b-6 border-b-zinc-950 text-zinc-700 dark:text-zinc-400 active:border-b-2 active:translate-y-[4px] flex items-center justify-center transition-all cursor-pointer select-none"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Interruption Logger */}
          {isRunning && (
            <button
              onClick={() => setInterruptions(prev => prev + 1)}
              className="w-full h-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-950 border-b-4 border-b-zinc-950 hover:border-red-400/20 hover:text-red-500 text-zinc-400 dark:text-zinc-500 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-xs font-black cursor-pointer select-none"
            >
              <AlertCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              Log Interruption ({interruptions})
            </button>
          )}

          {/* Manual Completion Trigger */}
          {!isRunning && timeLeft < totalSeconds && (
            <button
              onClick={handleSessionComplete}
              className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-400 border-2 border-zinc-950 border-b-6 border-b-red-700 active:border-b-2 active:translate-y-[4px] text-white transition-all flex items-center justify-center gap-2 text-xs font-black shadow-md cursor-pointer select-none"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              End & Save Session
            </button>
          )}
        </div>
      </div>

      {/* Session Logger Modal */}
      {showLogModal && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121214] border-2 border-zinc-950 rounded-[32px] p-6 shadow-2xl animate-scale-in text-white">
            
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center border-2 border-zinc-950 animate-float">
                <Image src={mascot} alt="Mascot" width={48} height={48} className="object-contain" />
              </div>
              <h3 className="text-xl font-black text-white leading-none">Session Completed!</h3>
              <p className="text-xs text-zinc-400">Great job! Let's log your academic telemetry.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 border-2 border-zinc-950 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-zinc-550 font-bold block uppercase tracking-wider">Minutes Focused</span>
                  <span className="text-lg font-black text-[#14fac8]">
                    {Math.max(1, Math.round((totalSeconds - timeLeft) / 60))}
                  </span>
                </div>
                <div className="bg-zinc-900 border-2 border-zinc-950 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-zinc-550 font-bold block uppercase tracking-wider">Interruptions</span>
                  <span className="text-lg font-black text-[#f85c5c]">{interruptions}</span>
                </div>
              </div>

              {/* Comprehension Rating */}
              <div className="bg-zinc-900 border-2 border-zinc-950 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-500 font-black block uppercase tracking-widest text-center mb-2">Subject Mastery Rating</span>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMasteryRating(val)}
                      className="transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          val <= masteryRating 
                            ? "fill-amber-400 stroke-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" 
                            : "stroke-zinc-650"
                        }`} 
                        strokeWidth={2.5}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-bold mt-3 italic">
                  {masteryRating === 1 && "Extremely confused, need help!"}
                  {masteryRating === 2 && "Struggling with key syntax formulas."}
                  {masteryRating === 3 && "Reasonable understanding."}
                  {masteryRating === 4 && "Strong grasp, recall is high!"}
                  {masteryRating === 5 && "Flawless, ready to teach others!"}
                </p>
              </div>

              {/* Log Button */}
              <button
                onClick={handleLogSession}
                className="w-full h-13 rounded-2xl bg-[#14fac8] hover:bg-[#12dda2] border-2 border-zinc-950 text-[#070a13] font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Log Telemetry & Update Schedule
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
