"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, ChevronRight, MessageSquare, BrainCircuit, Play, Star, CheckCircle, Award, Sparkles, Plus, Minus, Moon, Sun, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";

interface DemoBlock {
  subject: string;
  time: string;
  task: string;
  color: string;
  badgeBg: string;
  leftBorder: string;
  badgeIcon: string;
  mascot: string;
  dotColor: string;
  textColor: string;
}

export default function WelcomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Live Simulator active tab state (connected to feature cards)
  const [simTab, setSimTab] = useState(1);
  const [simTicking, setSimTicking] = useState(false);
  const [simTime, setSimTime] = useState("25:00");
  const [simStars, setSimStars] = useState(4);
  const [simSaved, setSimSaved] = useState(false);

  // Simulated Phone Interactive State
  const [demoDate, setDemoDate] = useState("15");
  const [activeMiniTimer, setActiveMiniTimer] = useState<string | null>(null);
  const [miniTimerRunning, setMiniTimerRunning] = useState(false);
  const [miniTime, setMiniTime] = useState("25:00");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartSimTimer = () => {
    if (simTicking) return;
    setSimTicking(true);
    setSimTime("24:59");
    setTimeout(() => {
      setSimTime("24:58");
    }, 1000);
  };

  const handleToggleMiniTimer = (subject: string) => {
    if (activeMiniTimer === subject) {
      setActiveMiniTimer(null);
      setMiniTimerRunning(false);
    } else {
      setActiveMiniTimer(subject);
      setMiniTime("25:00");
      setMiniTimerRunning(true);
    }
  };

  // Simulated phone schedule data mapping
  const demoSchedules: Record<string, DemoBlock[]> = {
    "12": [
      {
        subject: "Introduction to Programming",
        time: "09:00 AM",
        task: "Syntax & variables recap.",
        color: "#2563eb",
        badgeBg: "bg-blue-600",
        leftBorder: "border-l-[5px] border-l-blue-600",
        badgeIcon: "</>",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-blue-600",
        textColor: "text-blue-600"
      },
      {
        subject: "Calculus I",
        time: "11:00 AM",
        task: "Limits & integration recap.",
        color: "#f85c5c",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500",
        badgeIcon: "∫",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-red-500",
        textColor: "text-red-500"
      }
    ],
    "13": [
      {
        subject: "Economics 101",
        time: "10:30 AM",
        task: "Market equilibrium curve drills.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "$",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      },
      {
        subject: "Communication Skills",
        time: "02:00 PM",
        task: "Writing citation & citation tools.",
        color: "#8b5cf6",
        badgeBg: "bg-purple-600",
        leftBorder: "border-l-[5px] border-l-purple-600",
        badgeIcon: "✍",
        mascot: "/milo_mascot.png",
        dotColor: "bg-purple-600",
        textColor: "text-purple-600"
      }
    ],
    "14": [
      {
        subject: "Introduction to Programming",
        time: "10:00 AM",
        task: "Loop conditions active exercises.",
        color: "#2563eb",
        badgeBg: "bg-blue-600",
        leftBorder: "border-l-[5px] border-l-blue-600",
        badgeIcon: "</>",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-blue-600",
        textColor: "text-blue-600"
      },
      {
        subject: "Economics 101",
        time: "11:30 AM",
        task: "Supply and demand curve review.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "$",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      }
    ],
    "15": [
      {
        subject: "Introduction to Programming",
        time: "10:00 AM",
        task: "Function parameters recap.",
        color: "#2563eb",
        badgeBg: "bg-blue-600",
        leftBorder: "border-l-[5px] border-l-blue-600",
        badgeIcon: "</>",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-blue-600",
        textColor: "text-blue-600"
      },
      {
        subject: "Calculus I",
        time: "11:30 AM",
        task: "Derivative active recall list.",
        color: "#f85c5c",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500",
        badgeIcon: "∫",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-red-500",
        textColor: "text-red-500"
      }
    ],
    "16": [
      {
        subject: "Communication Skills",
        time: "09:00 AM",
        task: "Presentation methods checklist.",
        color: "#8b5cf6",
        badgeBg: "bg-purple-600",
        leftBorder: "border-l-[5px] border-l-purple-600",
        badgeIcon: "✍",
        mascot: "/milo_mascot.png",
        dotColor: "bg-purple-600",
        textColor: "text-purple-600"
      },
      {
        subject: "Economics 101",
        time: "11:30 AM",
        task: "Consumer theory quiz recap.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "$",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      }
    ]
  };

  const datesList = [
    { day: "Mon", date: "12" },
    { day: "Tue", date: "13" },
    { day: "Wed", date: "14" },
    { day: "Today", date: "15" },
    { day: "Fri", date: "16" }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-800 dark:text-zinc-100 flex flex-col overflow-x-hidden relative font-sans transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-[#14fac8]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[130px] pointer-events-none" />

      {/* Sticky Comic Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between shrink-0 z-20 border-b-4 border-zinc-950 bg-[#fffdf9]/90 dark:bg-[#0c0e17]/90 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 p-1 flex items-center justify-center animate-float">
            <Image src="/milo_mascot.png" alt="Milo Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 font-heading">
            Milo
            <span className="text-[10px] bg-emerald-500 border-2 border-zinc-950 text-white rounded-xl px-2 py-0.5 font-black uppercase tracking-wider ml-1 rotate-6 inline-block">
              Uni
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-all active:scale-95 group shadow-sm cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
          <Link 
            href="/onboarding?mode=register"
            className="px-4 py-2 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white border-2 border-b-4 border-zinc-950 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
          >
            Register
          </Link>
          <Link 
            href="/onboarding?mode=signin"
            className="px-4 py-2 rounded-2xl text-xs font-black bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-2 border-b-4 border-zinc-950 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 py-16 z-10">
        
        {/* Left Column (Mascot Guide & CTAs) */}
        <div className="flex-1 flex flex-col max-w-xl text-center lg:text-left space-y-8">
          
          {/* Cartoon Speech Bubble Coach (Every Page Mascot Integration) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 border-2 border-b-6 border-zinc-950 rounded-[32px] p-5 shadow-lg animate-scale-in relative">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
              <Image src="/milo_mascot.png" alt="Milo Coach" width={56} height={56} className="object-contain" />
            </div>
            <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-3 rounded-2xl border-2 border-zinc-950 text-left font-semibold text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <span className="font-black text-blue-600 dark:text-[#14fac8] uppercase tracking-wide block mb-1">Milo Academic Coach:</span>
              "Sasa! I am your study buddy. Unlike flat calendar apps, I help you schedule spaced-repetition modules, track focus telemetry, and master university courses. Ready to level up?"
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08] text-zinc-900 dark:text-white">
              Level Up Your <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-[#14fac8] dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
                Academic Potential.
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed font-semibold">
              Milo is an intelligent study coach built specifically for Kenyan university students. Track focus telemetry, organize spaced-repetition schedules, and chat with an AI coach grounded in your course modules.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            {/* Card 1: Telemetry Capture */}
            <div 
              onClick={() => { setSimTab(1); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(1); setSimSaved(false); }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm text-left ${
                simTab === 1 
                  ? "border-zinc-950 border-b-6 bg-blue-50/50 dark:bg-blue-900/10 scale-105" 
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-900"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 border border-zinc-950 text-white flex items-center justify-center shadow-sm mb-2">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className="font-black text-xs text-zinc-800 dark:text-zinc-100">Telemetry Capture</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-normal">Logs actual study minutes and ratings by course module.</p>
            </div>

            {/* Card 2: Spaced Recalculation */}
            <div 
              onClick={() => { setSimTab(3); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(3); setSimSaved(false); }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm text-left ${
                simTab === 3 
                  ? "border-zinc-950 border-b-6 bg-red-50/50 dark:bg-red-900/10 scale-105" 
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-900"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-red-500 border border-zinc-950 text-white flex items-center justify-center shadow-sm mb-2">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="font-black text-xs text-zinc-800 dark:text-zinc-100">Spaced Recalculation</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-normal">Automatically shifts scheduled review times for weaker topics.</p>
            </div>

            {/* Card 3: Syllabus AI Buddy */}
            <div 
              onClick={() => { setSimTab(2); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(2); setSimSaved(false); }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-sm text-left ${
                simTab === 2 
                  ? "border-zinc-950 border-b-6 bg-purple-50/50 dark:bg-purple-900/10 scale-105" 
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-900"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 border border-zinc-950 text-white flex items-center justify-center shadow-sm mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-black text-xs text-zinc-800 dark:text-zinc-100">Syllabus AI Buddy</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-normal">Real-time chat coach grounded in your uploaded PDF lecture slides.</p>
            </div>

          </div>

          {/* CTA Buttons - Fixed exact modes routing */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href="/onboarding?mode=register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-blue-600 hover:bg-blue-500 text-white border-2 border-b-6 border-zinc-950 active:translate-y-[4px] active:border-b-2 flex items-center justify-center gap-2 group transition-all duration-150 text-sm cursor-pointer shadow-sm"
            >
              Register Account 
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </Link>
            <Link 
              href="/onboarding?mode=signin"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white border-2 border-b-6 border-zinc-950 active:translate-y-[4px] active:border-b-2 flex items-center justify-center gap-2 transition-all duration-150 text-sm cursor-pointer shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Column (Simulated Cartoon Phone Demo) */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-sm lg:max-w-md animate-scale-in py-8 select-none">
          
          {/* Animated floating stickers */}
          <div className="absolute top-[10%] left-[-15px] z-20 w-16 h-16 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-zinc-950 animate-float pointer-events-none">
            <Image src="/calculator_mascot.png" alt="Math Mascot" width={60} height={60} className="object-contain" />
          </div>
          <div className="absolute bottom-[20%] right-[-10px] z-20 w-16 h-16 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-zinc-950 animate-float-delayed pointer-events-none">
            <Image src="/earth_mascot.png" alt="Geo Mascot" width={60} height={60} className="object-contain" />
          </div>
          <div className="absolute top-[45%] right-[-25px] z-20 w-14 h-14 rounded-3xl bg-white p-2 shadow-xl border-2 border-zinc-950 animate-float pointer-events-none">
            <Image src="/milo_mascot.png" alt="Milo Mascot" width={50} height={50} className="object-contain animate-wiggle" />
          </div>

          {/* Simulated Phone chassis */}
          <div className="w-[310px] h-[610px] rounded-[48px] border-4 border-b-8 border-zinc-950 bg-white dark:bg-[#0c0e17] shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500">
            
            {/* Phone Header */}
            <div className="bg-zinc-950 px-4 pt-3.5 pb-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Image src="/milo_mascot.png" alt="Logo" width={16} height={16} className="object-contain" />
                <span className="text-[10px] font-black text-white tracking-tight uppercase">Milo Live Demo</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#14fac8] shadow-[0_0_6px_#14fac8]" />
            </div>

            {/* Timeline View inside phone */}
            <div className="flex-1 p-4 flex flex-col justify-start space-y-4 overflow-hidden bg-slate-50 dark:bg-zinc-950 relative">
              
              {/* Pill Date Selector */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-950 rounded-2xl p-1.5 flex justify-between items-center text-[8px] font-black text-zinc-500 shrink-0 shadow-sm">
                {datesList.map(d => {
                  const isSelected = demoDate === d.date;
                  return (
                    <button
                      key={d.date}
                      onClick={() => { setDemoDate(d.date); setActiveMiniTimer(null); }}
                      className={`px-2 py-1 rounded-xl transition-all font-black ${
                        isSelected 
                          ? "bg-blue-600 border border-zinc-950 text-white font-black scale-105 shadow-sm" 
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {d.day === "Today" ? "Today" : `${d.day} ${d.date}`}
                    </button>
                  );
                })}
              </div>

              {/* Schedules List */}
              <div className="flex-grow flex flex-col justify-start relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-4 overflow-y-auto no-scrollbar">
                
                {demoSchedules[demoDate] && demoSchedules[demoDate].length > 0 ? (
                  demoSchedules[demoDate].map((item, index) => {
                    return (
                      <div 
                        key={`${item.subject}-${index}`} 
                        onClick={() => handleToggleMiniTimer(item.subject)}
                        className="relative animate-scale-in cursor-pointer group/item"
                      >
                        {/* Dot */}
                        <div className={`absolute top-5 -left-[31px] w-2.5 h-2.5 rounded-full ${item.dotColor} border-2 border-zinc-950`} />
                        <span className={`text-[8px] font-black block mb-1 uppercase ${item.textColor}`}>{item.time}</span>
                        
                        {/* Card Chassis with wiggling interaction */}
                        <div className={`bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-2.5 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 shadow-sm ${item.leftBorder}`}>
                          <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-black text-[8px] border border-zinc-950 shrink-0 ${item.badgeBg}`}>
                            {item.badgeIcon}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <h4 className="text-[9px] font-black text-zinc-900 dark:text-white flex items-center justify-between">
                              <span className="truncate">{item.subject}</span>
                              <span className="text-[6px] text-blue-500 font-bold uppercase shrink-0 border border-blue-500/20 px-1 rounded">TAP</span>
                            </h4>
                            <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-semibold truncate mt-0.5 leading-none">{item.task}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[10px] text-zinc-400 font-bold">No units scheduled for this date.</div>
                )}

              </div>

              {/* Pomodoro Focus Mini-Timer Popup */}
              {activeMiniTimer && (
                <div className="absolute inset-x-3 bottom-3 bg-zinc-900 border-2 border-zinc-950 text-white rounded-3xl p-3.5 shadow-2xl animate-slide-up flex flex-col items-center justify-center space-y-2.5 z-30">
                  <div className="flex items-center justify-between w-full border-b border-zinc-800 pb-1.5 shrink-0">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider">{activeMiniTimer} Session</span>
                    <button 
                      onClick={() => setActiveMiniTimer(null)} 
                      className="text-zinc-500 hover:text-white font-black text-xs px-1"
                    >
                      ×
                    </button>
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-zinc-950 flex flex-col items-center justify-center bg-zinc-950 shadow-inner relative">
                    <span className="text-[10px] font-black font-mono tracking-tight">{miniTime}</span>
                  </div>
                  <button 
                    onClick={() => { setMiniTimerRunning(!miniTimerRunning); setMiniTime(miniTimerRunning ? "25:00" : "24:59"); }}
                    className="px-3.5 py-1.5 bg-[#14fac8] text-zinc-950 text-[8px] font-black rounded-xl border border-zinc-950 hover:bg-[#12dda2] transition-transform active:scale-95 cursor-pointer"
                  >
                    {miniTimerRunning ? "Pause Timer" : "Start Focus"}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* Interactive Closed-Loop Explanations Section */}
      <section className="bg-slate-50 dark:bg-zinc-950 py-16 border-t-4 border-b-4 border-zinc-950 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Controls */}
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-xs font-black text-blue-600 tracking-wider uppercase">Interactive Explanations</span>
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight mt-1">
                How Milo's Closed-Loop Study Cycle Works
              </h2>
              <p className="text-sm text-zinc-500 mt-2 font-semibold">
                Click the active phases below to simulate the automated learning queue in real-time.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Step 1 Control */}
              <button 
                onClick={() => { setSimTab(1); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-[28px] border-2 transition-all flex gap-3.5 items-start ${
                  simTab === 1 
                    ? "bg-white dark:bg-zinc-900 border-zinc-950 border-b-6 shadow-md" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border border-zinc-950 shrink-0 ${
                  simTab === 1 ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100">Telemetry Capture Timer</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">Students study with an active Pomodoro timer. Milo logs study minutes, phone interruptions, and focus spikes.</p>
                </div>
              </button>

              {/* Step 2 Control */}
              <button 
                onClick={() => { setSimTab(2); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-[28px] border-2 transition-all flex gap-3.5 items-start ${
                  simTab === 2 
                    ? "bg-white dark:bg-zinc-900 border-zinc-950 border-b-6 shadow-md" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border border-zinc-950 shrink-0 ${
                  simTab === 2 ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100">Mastery Assessment</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">Immediately after focus, students rate their comprehension (1-5 stars) and take rapid syllabus-grounded quizzes.</p>
                </div>
              </button>

              {/* Step 3 Control */}
              <button 
                onClick={() => { setSimTab(3); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-[28px] border-2 transition-all flex gap-3.5 items-start ${
                  simTab === 3 
                    ? "bg-white dark:bg-zinc-900 border-zinc-950 border-b-6 shadow-md" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border border-zinc-950 shrink-0 ${
                  simTab === 3 ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  3
                </div>
                <div>
                  <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100">Automated Rescheduling</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">The recall engine identifies weaker topics and automatically shifts scheduled blocks to maximize retention.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Simulator Console panel */}
          <div className="w-full max-w-sm bg-white dark:bg-[#121214] border-2 border-b-8 border-zinc-950 rounded-[32px] p-6 shadow-md min-h-[300px] flex flex-col justify-between relative overflow-hidden animate-scale-in">
            
            {/* Step 1 Console View */}
            {simTab === 1 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Phase 1: Telemetry</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-zinc-950" />
                </div>
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-zinc-950 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 shadow-inner relative overflow-hidden">
                    <span className="text-2xl font-black font-mono tracking-tight">{simTime}</span>
                    <span className="text-[8px] font-black text-zinc-400 block uppercase tracking-wider mt-1">Programming</span>
                  </div>
                  <button 
                    onClick={handleStartSimTimer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 border-2 border-b-4 border-zinc-950 active:translate-y-[4px] active:border-b-2 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> {simTicking ? "Ticking..." : "Start Study Timer"}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-bold">Ticking study sessions log phone pickups as distractions.</p>
              </div>
            )}

            {/* Step 2 Console View */}
            {simTab === 2 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Phase 2: Evaluation</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="py-6 flex flex-col items-center space-y-4">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Rate Concept Comprehension</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button 
                        key={v} 
                        onClick={() => setSimStars(v)}
                        className="transition-transform active:scale-90"
                      >
                        <Star className={`w-7 h-7 ${v <= simStars ? "fill-amber-400 stroke-amber-400" : "stroke-zinc-400"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-2xl p-3 text-center text-[10px] font-black text-zinc-500 max-w-xs leading-relaxed">
                    {simStars === 1 && "Extremely confused, reschedule immediately!"}
                    {simStars === 2 && "Struggling with syntax parameters, need review."}
                    {simStars === 3 && "Reasonable understanding."}
                    {simStars === 4 && "Strong grasp, high recall."}
                    {simStars === 5 && "Flawless, ready for exams."}
                  </div>
                </div>
                <button 
                  onClick={() => setSimSaved(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 border-2 border-b-4 border-zinc-950 active:translate-y-[4px] active:border-b-2 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {simSaved ? "Telemetry Synced!" : "Save Comprehension Rating"}
                </button>
              </div>
            )}

            {/* Step 3 Console View */}
            {simTab === 3 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Phase 3: Rescheduling</span>
                  <Sparkles className="w-4 h-4 text-[#14fac8]" />
                </div>
                <div className="py-6 flex flex-col justify-start space-y-3.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Recalculating Spaced Queue...</span>
                  <div className="space-y-2.5">
                    {/* Shifted Card */}
                    <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-2xl p-2.5 flex items-center justify-between shadow-sm animate-pulse">
                      <div>
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-wide">SHIFTS TODAY (11:30 AM)</span>
                        <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">Programming (Comprehension 2★)</h4>
                      </div>
                      <span className="text-[8px] bg-red-100 border border-zinc-950 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">HIGH PRIO</span>
                    </div>
                    {/* Postponed Card */}
                    <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-2xl p-2.5 flex items-center justify-between opacity-50 shadow-sm">
                      <div>
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">POSTPONED TO FRI 16</span>
                        <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">Economics 101 (Comprehension 5★)</h4>
                      </div>
                      <span className="text-[8px] bg-zinc-200 border border-zinc-950 text-zinc-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">LOWER PRIO</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-bold">Rescheduling loop prevents study fatigue and target weak modules.</p>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Beautiful Comic Footer */}
      <footer className="w-full bg-[#121214] text-zinc-400 border-t-4 border-zinc-950 shrink-0 z-20 py-16 px-6 font-semibold select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm leading-relaxed">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-zinc-950">
                <Image src="/milo_mascot.png" alt="Milo Mascot" width={24} height={24} className="object-contain animate-float" />
              </div>
              <span className="text-xl font-black text-white">Milo</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal max-w-xs">
              Milo is Kenya's first closed-loop study planner and academic behavior coach. Helping university students master their courses through advanced spaced repetition and telemetry timers.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-black text-zinc-200 uppercase tracking-widest text-[10px]">Academic Hubs</h4>
            <ul className="space-y-2">
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Introduction to Programming</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Calculus I Hub</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Economics 101 Hub</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Communication Skills</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-black text-zinc-200 uppercase tracking-widest text-[10px]">Core Features</h4>
            <ul className="space-y-2">
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Telemetry Timer</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Mastery Assessors</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">Recall Scheduler</Link></li>
              <li><Link href="/onboarding?mode=register" className="hover:text-blue-500 transition-colors">AI Study Buddy</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-black text-zinc-200 uppercase tracking-widest text-[10px]">Supported Institutions</h4>
            <p className="text-xs text-zinc-400 leading-normal">
              Tailored modules active for University of Nairobi (UoN), JKUAT, Kenyatta University, Strathmore, USIU-A, and other accredited universities in Kenya.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Milo Learning Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/welcome" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/welcome" className="hover:text-zinc-300">Terms of Service</Link>
            <Link href="/welcome" className="hover:text-zinc-300">Academic Integrity</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
