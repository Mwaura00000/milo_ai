"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, AlertCircle, RotateCcw, Sparkles, Star, Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FocusPage() {
  const router = useRouter();
  
  // Dynamic subject loading
  const [subject, setSubject] = useState("Mathematics");
  const [mascot, setMascot] = useState("/calculator_mascot.png");
  const [accentColor, setAccentColor] = useState("text-[#f85c5c]");

  useEffect(() => {
    // Attempt loading active focus subject
    let active = localStorage.getItem("active_focus_subject");
    if (!active) {
      const savedList = localStorage.getItem("milo_active_subjects");
      if (savedList) {
        const list = JSON.parse(savedList) as string[];
        if (list.length > 0) active = list[0];
      }
    }

    if (active) {
      setSubject(active);
      const name = active.trim().toLowerCase();
      
      // Map mascots & colors
      if (name.includes("math")) {
        setMascot("/calculator_mascot.png");
        setAccentColor("text-[#f85c5c]");
      } else if (name.includes("geography") || name.includes("geo")) {
        setMascot("/earth_mascot.png");
        setAccentColor("text-[#14fac8]");
      } else if (name.includes("physics") || name.includes("phys")) {
        setMascot("/physics_mascot.png");
        setAccentColor("text-[#f85c5c]");
      } else if (name.includes("chemistry") || name.includes("chem")) {
        setMascot("/chemistry_mascot.png");
        setAccentColor("text-[#14fac8]");
      } else {
        // Fallback custom subject styling
        setMascot("/milo_mascot.png");
        setAccentColor("text-purple-400");
      }
    }
  }, []);

  // Timer states
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [masteryRating, setMasteryRating] = useState(3);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timeLeft when duration changes (only if not running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, isRunning]);

  // Timer runner
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
    
    // Collect telemetry data to log
    const sessionData = {
      subject,
      duration: durationMinutes,
      actualMinutes: activeMinutes,
      interruptions,
      mastery: masteryRating,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Log to database client
      await supabase.from("study_sessions").insert({
        duration_minutes: activeMinutes,
        interruptions_count: interruptions,
        mastery_rating: masteryRating,
        created_at: sessionData.timestamp
      });
      
      // Save local study logs history
      const existing = JSON.parse(localStorage.getItem("study_sessions") || "[]");
      localStorage.setItem("study_sessions", JSON.stringify([...existing, sessionData]));
    } catch (e) {
      console.error("Session log writing error:", e);
    }
    
    setShowLogModal(false);
    handleReset();
    
    router.push("/insights");
  };

  // Helper formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculating progress percentage for circular ring
  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const strokeDashoffset = 502 - (502 * progressPercent) / 100;

  const isTealTheme = subject.includes("Geography") || subject.includes("Geo") || subject.includes("Chemistry") || subject.includes("Chem");

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#070a13] text-foreground transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">
      
      {/* Title */}
      <div className="px-6 pt-8 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none text-slate-800 dark:text-zinc-50">Focus Timer</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">Active Subject: <span className={accentColor}>{subject}</span></p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse-glow">
          <Sparkles className="w-3 h-3" />
          POMODORO
        </div>
      </div>

      {/* Main Focus Console */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center space-y-10 my-4">
        
        {/* Glowing Circle Timer Container */}
        <div className="relative w-64 h-64 flex items-center justify-center animate-scale-in">
          
          <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/80 shadow-md" />
          
          <svg className="w-64 h-64 -rotate-90 absolute z-10" viewBox="0 0 172 172">
            <circle
              className="transition-all duration-300"
              cx="86"
              cy="86"
              r="80"
              stroke={isTealTheme ? "#14fac8" : subject === "Mathematics" || subject === "Physics" ? "#f85c5c" : "#a855f7"}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="502"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central mascot & countdown */}
          <div className="absolute z-20 flex flex-col items-center text-center">
            
            {/* Mascot circular sticker container */}
            <div className="w-20 h-20 rounded-full bg-white p-3 shadow-md border border-zinc-200 flex items-center justify-center relative overflow-hidden mb-2 group">
              <Image 
                src={mascot} 
                alt="Subject Mascot" 
                width={56} 
                height={56} 
                className="object-contain animate-float"
              />
            </div>

            <span className="text-4xl font-black tracking-tight tabular-nums font-mono leading-none dark:text-white">
              {formatTime(timeLeft)}
            </span>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1.5">{subject}</p>
          </div>
        </div>

        {/* Duration Adjust */}
        {!isRunning && (
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-3xl p-3 flex items-center justify-between shadow-md text-white animate-scale-in">
            <button 
              onClick={() => setDurationMinutes(prev => Math.max(5, prev - 5))}
              className="w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <Minus className="w-4 h-4 text-zinc-300" />
            </button>
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 font-black block uppercase tracking-wider">Set Interval</span>
              <span className="text-lg font-black text-[#14fac8]">{durationMinutes} min</span>
            </div>
            <button 
              onClick={() => setDurationMinutes(prev => Math.min(60, prev + 5))}
              className="w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="w-full max-w-xs space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleStartPause}
              className={`flex-1 h-14 rounded-2xl font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isRunning 
                  ? "bg-zinc-900 border border-zinc-800 text-amber-400 hover:border-amber-400/30" 
                  : "bg-[#14fac8] hover:bg-[#12dda2] text-[#070a13]"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 stroke-[3]" /> Paused
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Interruption Logger */}
          {isRunning && (
            <button
              onClick={() => setInterruptions(prev => prev + 1)}
              className="w-full h-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-400/30 dark:text-zinc-500 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
            >
              <AlertCircle className="w-4 h-4" />
              Log Interruption ({interruptions})
            </button>
          )}

          {/* Manual Completion Trigger */}
          {!isRunning && timeLeft < totalSeconds && (
            <button
              onClick={handleSessionComplete}
              className="w-full h-11 rounded-2xl bg-[#f85c5c] text-white hover:bg-[#eb4848] transition-colors flex items-center justify-center gap-2 text-xs font-black shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              End & Save Session
            </button>
          )}
        </div>
      </div>

      {/* Session Logger Modal */}
      {showLogModal && (
        <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121214] border border-zinc-800 rounded-[32px] p-6 shadow-2xl animate-scale-in text-white">
            
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center border border-zinc-700 animate-float">
                <Image src={mascot} alt="Mascot" width={48} height={48} className="object-contain" />
              </div>
              <h3 className="text-xl font-black text-white leading-none">Session Completed!</h3>
              <p className="text-xs text-zinc-400">Great job! Let's log your academic telemetry.</p>
            </div>

            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Minutes Focused</span>
                  <span className="text-lg font-black text-[#14fac8]">
                    {Math.max(1, Math.round((totalSeconds - timeLeft) / 60))}
                  </span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Interruptions</span>
                  <span className="text-lg font-black text-[#f85c5c]">{interruptions}</span>
                </div>
              </div>

              {/* Spaced Repetition Mastery Rating (1-5 Stars) */}
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
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
                            : "stroke-zinc-600"
                        }`} 
                        strokeWidth={2.5}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-semibold mt-3 italic">
                  {masteryRating === 1 && "Extremely confused, need help!"}
                  {masteryRating === 2 && "Struggling with key formulas."}
                  {masteryRating === 3 && "Reasonable understanding."}
                  {masteryRating === 4 && "Strong grasp, recall is high!"}
                  {masteryRating === 5 && "Flawless, ready to teach others!"}
                </p>
              </div>

              {/* Log Button */}
              <button
                onClick={handleLogSession}
                className="w-full h-13 rounded-2xl bg-[#14fac8] hover:bg-[#12dda2] text-[#070a13] font-black text-sm tracking-wide shadow-md transition-colors flex items-center justify-center gap-2"
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
