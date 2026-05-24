"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, ChevronRight, MessageSquare, BrainCircuit, Play, Star, CheckCircle, ArrowRight, Award, Sparkles, AlertCircle, RefreshCw, Sparkle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
  // Live Simulator active tab state (connected to feature cards)
  const [simTab, setSimTab] = useState(1);
  const [simTicking, setSimTicking] = useState(false);
  const [simTime, setSimTime] = useState("25:00");
  const [simStars, setSimStars] = useState(3);
  const [simSaved, setSimSaved] = useState(false);

  // Simulated Phone Interactive State
  const [demoDate, setDemoDate] = useState("15");
  const [activeMiniTimer, setActiveMiniTimer] = useState<string | null>(null);
  const [miniTimerRunning, setMiniTimerRunning] = useState(false);
  const [miniTime, setMiniTime] = useState("25:00");

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
      // Toggle off
      setActiveMiniTimer(null);
      setMiniTimerRunning(false);
    } else {
      // Launch
      setActiveMiniTimer(subject);
      setMiniTime("25:00");
      setMiniTimerRunning(true);
    }
  };

  // Simulated phone schedule data mapping
  const demoSchedules: Record<string, DemoBlock[]> = {
    "12": [
      {
        subject: "Mathematics",
        time: "09:00 AM",
        task: "Algebra Chapter 4 problem solving.",
        color: "#f85c5c",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500",
        badgeIcon: "%",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-red-500",
        textColor: "text-red-500"
      },
      {
        subject: "Physics",
        time: "11:00 AM",
        task: "Electromagnetism equation recap.",
        color: "#6366f1",
        badgeBg: "bg-indigo-500",
        leftBorder: "border-l-[5px] border-l-indigo-500",
        badgeIcon: "Φ",
        mascot: "/physics_mascot.png",
        dotColor: "bg-indigo-500",
        textColor: "text-indigo-500"
      }
    ],
    "13": [
      {
        subject: "Geography",
        time: "10:30 AM",
        task: "East African climate zone maps.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "⊕",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      },
      {
        subject: "Chemistry",
        time: "02:00 PM",
        task: "Stoichiometry formula review.",
        color: "#8b5cf6",
        badgeBg: "bg-purple-600",
        leftBorder: "border-l-[5px] border-l-purple-600",
        badgeIcon: "⚗",
        mascot: "/chemistry_mascot.png",
        dotColor: "bg-purple-600",
        textColor: "text-purple-600"
      }
    ],
    "14": [
      {
        subject: "Mathematics",
        time: "10:00 AM",
        task: "Linear equation active review.",
        color: "#f85c5c",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500",
        badgeIcon: "%",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-red-500",
        textColor: "text-red-500"
      },
      {
        subject: "Geography",
        time: "11:30 AM",
        task: "Tectonic plate movements checklist.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "⊕",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      }
    ],
    "15": [
      {
        subject: "Mathematics",
        time: "10:00 AM",
        task: "Algebra focus block.",
        color: "#f85c5c",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500",
        badgeIcon: "%",
        mascot: "/calculator_mascot.png",
        dotColor: "bg-red-500",
        textColor: "text-red-500"
      },
      {
        subject: "Geography",
        time: "11:30 AM",
        task: "Ecosystems active review.",
        color: "#10b981",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600",
        badgeIcon: "⊕",
        mascot: "/earth_mascot.png",
        dotColor: "bg-emerald-600",
        textColor: "text-emerald-600"
      }
    ],
    "16": [
      {
        subject: "Physics",
        time: "09:00 AM",
        task: "Wave properties analysis.",
        color: "#6366f1",
        badgeBg: "bg-indigo-500",
        leftBorder: "border-l-[5px] border-l-indigo-500",
        badgeIcon: "Φ",
        mascot: "/physics_mascot.png",
        dotColor: "bg-indigo-500",
        textColor: "text-indigo-500"
      },
      {
        subject: "Chemistry",
        time: "11:30 AM",
        task: "Organic chemistry carbon models.",
        color: "#8b5cf6",
        badgeBg: "bg-purple-600",
        leftBorder: "border-l-[5px] border-l-purple-600",
        badgeIcon: "⚗",
        mascot: "/chemistry_mascot.png",
        dotColor: "bg-purple-600",
        textColor: "text-purple-600"
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#070a13] text-zinc-800 dark:text-zinc-100 flex flex-col overflow-x-hidden relative font-sans transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-[#14fac8]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[130px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between shrink-0 z-20 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-[#070a13]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700 animate-float">
            <Image src="/milo_mascot.png" alt="Milo Logo" width={28} height={28} className="object-contain" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Milo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/onboarding"
            className="px-5 py-2.5 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
          >
            Register / Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 py-16 z-10">
        
        {/* Left Column (Details + CTAs) */}
        <div className="flex-1 flex flex-col max-w-xl text-center lg:text-left space-y-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.08] animate-slide-up text-zinc-900 dark:text-white">
            Level Up Your <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-[#14fac8] dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
              Academic Potential.
            </span>
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed animate-slide-up [animation-delay:100ms] font-semibold">
            Milo is an intelligent study coach built specifically for Kenyan university students. Track focus telemetry, organize spaced-repetition schedules, and chat with an AI coach grounded in your course modules.
          </p>

          {/* Interactive Feature Cards (Hovering sets simulator active states!) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 animate-slide-up [animation-delay:200ms]">
            
            {/* Card 1: Telemetry Capture */}
            <div 
              onClick={() => { setSimTab(1); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(1); setSimSaved(false); }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm duration-300 group text-left ${
                simTab === 1 
                  ? "bg-blue-50/50 border-blue-500 dark:bg-blue-900/10 dark:border-blue-500 scale-105" 
                  : "bg-slate-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-blue-500/20"
              }`}
            >
              <Timer className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">Telemetry Capture</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold leading-normal">Logs actual study minutes and ratings by course module.</p>
            </div>

            {/* Card 2: Spaced Recalculation */}
            <div 
              onClick={() => { setSimTab(3); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(3); setSimSaved(false); }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm duration-300 group text-left ${
                simTab === 3 
                  ? "bg-red-50/50 border-red-500 dark:bg-red-900/10 dark:border-red-500 scale-105" 
                  : "bg-slate-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-red-500/20"
              }`}
            >
              <BrainCircuit className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">Spaced Recalculation</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold leading-normal">Automatically shifts scheduled review times for weaker topics.</p>
            </div>

            {/* Card 3: Syllabus AI Buddy */}
            <div 
              onClick={() => { setSimTab(2); setSimSaved(false); }}
              onMouseEnter={() => { setSimTab(2); setSimSaved(false); }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm duration-300 group text-left ${
                simTab === 2 
                  ? "bg-purple-50/50 border-purple-500 dark:bg-purple-900/10 dark:border-purple-500 scale-105" 
                  : "bg-slate-50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-purple-500/20"
              }`}
            >
              <MessageSquare className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">Syllabus AI Buddy</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold leading-normal">Real-time chat coach grounded in your uploaded PDF lecture slides.</p>
            </div>

          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6 animate-slide-up [animation-delay:300ms]">
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95 text-lg cursor-pointer"
            >
              Register Account 
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </Link>
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white shadow-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 text-lg cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Column (FULLY INTERACTIVE Simulated Phone Demo!) */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-sm lg:max-w-md animate-scale-in [animation-delay:200ms] py-8">
          
          {/* Animated floating stickers */}
          <div className="absolute top-[10%] left-[-15px] z-20 w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border border-zinc-200 animate-float pointer-events-none">
            <Image src="/calculator_mascot.png" alt="Math Mascot" width={60} height={60} className="object-contain" />
          </div>
          <div className="absolute bottom-[20%] right-[-10px] z-20 w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border border-zinc-200 animate-float-delayed pointer-events-none">
            <Image src="/earth_mascot.png" alt="Geo Mascot" width={60} height={60} className="object-contain" />
          </div>
          <div className="absolute top-[45%] right-[-25px] z-20 w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-zinc-200 animate-float pointer-events-none">
            <Image src="/milo_mascot.png" alt="Milo Mascot" width={50} height={50} className="object-contain" />
          </div>
          <div className="absolute bottom-[10%] left-[-20px] z-20 w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-zinc-200 animate-float-delayed pointer-events-none">
            <Image src="/chemistry_mascot.png" alt="Chemistry Mascot" width={50} height={50} className="object-contain" />
          </div>

          {/* Fully Functional simulated Phone preview container */}
          <div className="w-[300px] h-[610px] rounded-[38px] border-[8px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0f17] shadow-2xl relative overflow-hidden flex flex-col group hover:shadow-[0_0_40px_rgba(37,99,235,0.12)] transition-all duration-500">
            
            {/* Dynamic Phone Header */}
            <div className="bg-[#121214] px-4 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-1.5">
                <Image src="/milo_mascot.png" alt="Logo" width={16} height={16} className="object-contain" />
                <span className="text-[11px] font-black text-white tracking-tight">Milo Live Demo</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#14fac8] shadow-[0_0_6px_#14fac8]" />
            </div>

            {/* Timeline view viewport */}
            <div className="flex-1 p-3 flex flex-col justify-start space-y-3.5 overflow-hidden select-none bg-white dark:bg-[#070a13] relative">
              
              {/* INTERACTIVE Pill Selector: Clicking dynamic dates updates scheduled items in the phone viewport! */}
              <div className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-2 flex justify-between items-center text-[8px] font-black text-zinc-500 shrink-0">
                {datesList.map(d => {
                  const isSelected = demoDate === d.date;
                  return (
                    <button
                      key={d.date}
                      onClick={() => { setDemoDate(d.date); setActiveMiniTimer(null); }}
                      className={`px-2 py-1 rounded-xl transition-all ${
                        isSelected 
                          ? "bg-blue-600 text-white font-black scale-105" 
                          : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {d.day === "Today" ? "Today" : `${d.day} ${d.date}`}
                    </button>
                  );
                })}
              </div>

              {/* Simulated timeline items list container */}
              <div className="flex-grow flex flex-col justify-start relative pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-4 overflow-y-auto no-scrollbar">
                
                {demoSchedules[demoDate] && demoSchedules[demoDate].length > 0 ? (
                  demoSchedules[demoDate].map((item, index) => {
                    return (
                      <div 
                        key={`${item.subject}-${index}`} 
                        onClick={() => handleToggleMiniTimer(item.subject)}
                        className="relative animate-scale-in cursor-pointer group/item"
                      >
                        {/* Dot */}
                        <div className={`absolute top-5 -left-[30px] w-2 h-2 rounded-full ${item.dotColor} border border-white dark:border-[#070a13]`} />
                        <span className={`text-[8px] font-bold block mb-1 ${item.textColor}`}>{item.time}</span>
                        
                        {/* Subject block chassis */}
                        <div className={`bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 flex items-center gap-2.5 transition-all group-hover/item:border-blue-600 ${item.leftBorder}`}>
                          <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[8px] ${item.badgeBg}`}>
                            {item.badgeIcon}
                          </div>
                          <div className="overflow-hidden flex-1">
                            <h4 className="text-[9px] font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {item.subject}
                              <span className="text-[6px] opacity-0 group-hover/item:opacity-100 text-blue-500 transition-opacity font-bold">CLICK</span>
                            </h4>
                            <p className="text-[7.5px] text-zinc-400 font-semibold truncate mt-0.5">{item.task}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[10px] text-zinc-400 font-bold">No units scheduled for this date.</div>
                )}

              </div>

              {/* Simulated active Pomodoro Mini-Timer (Pops up when they click Mathematics or Geography!) */}
              {activeMiniTimer && (
                <div className="absolute inset-x-2 bottom-2 bg-slate-900 border border-zinc-800 text-white rounded-2xl p-3.5 shadow-2xl animate-slide-up flex flex-col items-center justify-center space-y-2 z-30">
                  <div className="flex items-center justify-between w-full border-b border-zinc-800 pb-1.5 shrink-0">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider">{activeMiniTimer} Session</span>
                    <button 
                      onClick={() => setActiveMiniTimer(null)} 
                      className="text-zinc-500 hover:text-white font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-blue-500 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                    <span className="text-[10px] font-black font-mono">{miniTime}</span>
                  </div>
                  <button 
                    onClick={() => { setMiniTimerRunning(!miniTimerRunning); setMiniTime(miniTimerRunning ? "25:00" : "24:59"); }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-black rounded-lg transition-transform active:scale-95"
                  >
                    {miniTimerRunning ? "Pause Timer" : "Start Focus"}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* Interactive Closed-Loop Simulator Section */}
      <section className="bg-slate-50 dark:bg-zinc-950 py-16 border-t border-b border-zinc-150 dark:border-zinc-900 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Simulator Controls */}
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-xs font-black text-blue-600 tracking-wider uppercase">Interactive Experience</span>
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight mt-1">
                How Milo's Closed-Loop Study Cycle Works
              </h2>
              <p className="text-sm text-zinc-500 mt-2 font-semibold">
                Click the active phases below to simulate the automated learning queue in real-time.
              </p>
            </div>

            <div className="space-y-3">
              {/* Step 1 control */}
              <button 
                onClick={() => { setSimTab(1); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                  simTab === 1 
                    ? "bg-white dark:bg-zinc-900 border-blue-600 dark:border-blue-500 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  simTab === 1 ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100">Telemetry Capture Timer</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">Students study with an active Pomodoro timer. Milo logs study minutes, phone interruptions, and focus spikes.</p>
                </div>
              </button>

              {/* Step 2 control */}
              <button 
                onClick={() => { setSimTab(2); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                  simTab === 2 
                    ? "bg-white dark:bg-zinc-900 border-blue-600 dark:border-blue-500 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  simTab === 2 ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-black text-sm text-zinc-800 dark:text-zinc-100">Mastery Assessment</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">Immediately after focus, students rate their comprehension (1-5 stars) and take rapid syllabus-grounded quizzes.</p>
                </div>
              </button>

              {/* Step 3 control */}
              <button 
                onClick={() => { setSimTab(3); setSimSaved(false); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                  simTab === 3 
                    ? "bg-white dark:bg-zinc-900 border-blue-600 dark:border-blue-500 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
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

          {/* Simulator Console */}
          <div className="w-full max-w-sm bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-md min-h-[300px] flex flex-col justify-between relative overflow-hidden animate-scale-in">
            
            {/* Step 1 Console view */}
            {simTab === 1 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Phase 1: Telemetry</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 shadow-inner relative overflow-hidden">
                    <span className="text-2xl font-black font-mono tracking-tight">{simTime}</span>
                    <span className="text-[8px] font-black text-zinc-400 block uppercase tracking-wider mt-1">Mathematics</span>
                  </div>
                  <button 
                    onClick={handleStartSimTimer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> {simTicking ? "Ticking..." : "Start Study Timer"}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-semibold">Ticking study sessions log phone pickups as distractions.</p>
              </div>
            )}

            {/* Step 2 Console view */}
            {simTab === 2 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                  <span className="text-[10px] font-black text-red-500 uppercase">Phase 2: Evaluation</span>
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
                        <Star className={`w-6 h-6 ${v <= simStars ? "fill-amber-400 stroke-amber-400" : "stroke-zinc-400"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-3 text-center text-[10px] font-semibold text-zinc-500 max-w-xs leading-relaxed">
                    {simStars === 1 && "Extremely confused, reschedule immediately!"}
                    {simStars === 2 && "Struggling with formulas, need review."}
                    {simStars === 3 && "Standard understanding."}
                    {simStars === 4 && "Strong grasp, high retention."}
                    {simStars === 5 && "Flawless, ready for exams."}
                  </div>
                </div>
                <button 
                  onClick={() => setSimSaved(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-sm transition-colors"
                >
                  {simSaved ? "Telemetry Synced!" : "Save Comprehension Rating"}
                </button>
              </div>
            )}

            {/* Step 3 Console view */}
            {simTab === 3 && (
              <div className="flex-1 flex flex-col justify-between animate-scale-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase">Phase 3: Rescheduling</span>
                  <Sparkles className="w-4 h-4 text-[#14fac8]" />
                </div>
                <div className="py-6 flex flex-col justify-start space-y-3.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Recalculating Spaced Queue...</span>
                  <div className="space-y-2.5">
                    {/* Shifted card */}
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-2.5 flex items-center justify-between shadow-inner animate-pulse">
                      <div>
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">SHIFTS TODAY (11:30 AM)</span>
                        <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">Mathematics (Comprehension 2★)</h4>
                      </div>
                      <span className="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">HIGH PRIO</span>
                    </div>
                    {/* Postponed card */}
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-2.5 flex items-center justify-between opacity-50 shadow-inner">
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">POSTPONED TO FRI 16</span>
                        <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">Geography (Comprehension 5★)</h4>
                      </div>
                      <span className="text-[8px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">LOWER PRIO</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-semibold">Rescheduling loop prevents study fatigue and target weak modules.</p>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#121214] dark:bg-[#090d16] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-900 shrink-0 z-20 py-16 px-6 font-semibold">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm leading-relaxed">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-zinc-700">
                <Image src="/milo_mascot.png" alt="Milo Mascot" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xl font-extrabold text-white">Milo</span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-normal max-w-xs">
              Milo is Kenya's high-fidelity closed-loop study planner and academic behavior coach. Helping university students master their courses through advanced spaced repetition and telemetry timers.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-zinc-200 uppercase tracking-widest text-[10px]">Academic Hubs</h4>
            <ul className="space-y-2">
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Mathematics Hub</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Geography Hub</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Physics Hub</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Chemistry Hub</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-zinc-200 uppercase tracking-widest text-[10px]">Core Features</h4>
            <ul className="space-y-2">
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Telemetry Timer</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Mastery Assessors</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">Recall Scheduler</Link></li>
              <li><Link href="/onboarding" className="hover:text-blue-500 transition-colors">AI Study Buddy</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-zinc-200 uppercase tracking-widest text-[10px]">Supported Institutions</h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
              Tailored modules and course support active for University of Nairobi (UoN), JKUAT, Kenyatta University, Strathmore, USIU-A, and more.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200/10 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-600 gap-4">
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
