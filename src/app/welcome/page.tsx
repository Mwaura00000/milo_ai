"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Timer, ChevronRight, MessageSquare, BrainCircuit, Moon, Sun, ArrowRight, Zap, Target, Sparkles, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";

export default function WelcomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-800 dark:text-zinc-100 flex flex-col overflow-x-hidden relative font-sans transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-[#14fac8]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Sticky Premium Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between shrink-0 z-50 bg-transparent">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 rounded-[18px] bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 p-1 flex items-center justify-center animate-float shadow-sm">
            <Image src="/milo_mascot.png" alt="Milo Logo" width={38} height={38} className="object-contain" />
          </div>
          <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 font-heading">
            Milo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-all active:scale-95 group shadow-sm cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon className="w-6 h-6 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
          <Link 
            href="/onboarding?mode=signin"
            className="hidden sm:flex px-6 py-3 rounded-2xl text-sm font-black bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-2 border-b-4 border-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-700 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Bold Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center py-24 z-10">
        
        {/* Playful Floating Mascots surrounding the title */}
        <div className="relative w-full flex justify-center mb-8 pointer-events-none select-none">
          <div className="absolute -left-12 top-4 w-16 h-16 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-zinc-950 animate-float hidden md:block">
            <Image src="/calculator_mascot.png" alt="Math Mascot" width={60} height={60} className="object-contain" />
          </div>
          <div className="absolute -right-8 -top-8 w-16 h-16 rounded-3xl bg-white p-2.5 shadow-xl border-2 border-zinc-950 animate-float-delayed hidden md:block">
            <Image src="/earth_mascot.png" alt="Geo Mascot" width={60} height={60} className="object-contain" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4" /> The Future of Learning
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-zinc-900 dark:text-white max-w-4xl">
          Study Smarter, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-[#14fac8] dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent inline-block pb-2">
            Not Harder.
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-semibold max-w-2xl leading-relaxed">
          Milo is an intelligent study coach powered by cognitive science. It analyzes your unique learning biological rhythm, generates smart spaced-repetition schedules, and acts as your personal AI tutor.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link 
            href="/onboarding?mode=register"
            className="w-full sm:w-auto px-10 py-5 rounded-[24px] font-black bg-blue-600 hover:bg-blue-500 text-white border-2 border-b-6 border-zinc-950 active:translate-y-[4px] active:border-b-2 flex items-center justify-center gap-3 group transition-all duration-150 text-lg cursor-pointer shadow-lg"
          >
            Start Your Journey 
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" strokeWidth={3} />
          </Link>
          <Link 
            href="/onboarding?mode=signin"
            className="w-full sm:w-auto px-10 py-5 rounded-[24px] font-black bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border-2 border-b-6 border-zinc-950 active:translate-y-[4px] active:border-b-2 flex items-center justify-center transition-all duration-150 text-lg cursor-pointer shadow-lg sm:hidden"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Feature Showcase Grid */}
      <section className="bg-slate-50 dark:bg-zinc-950 py-24 border-t-4 border-b-4 border-zinc-950 z-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
              A complete cognitive engine.
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 font-semibold text-lg max-w-2xl mx-auto">
              We replaced flat calendars and generic timers with a biology-first approach to learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-[32px] p-8 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 border-2 border-zinc-950 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">Cognitive Persona Engine</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                Take a 1-minute assessment to uncover your biological rhythm. Milo learns if you have a "Sprint" or "Marathon" focus capacity, and if you learn best in the Morning, Afternoon, or Night.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-[32px] p-8 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border-2 border-zinc-950 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">Smart Study Planner</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                Stop manually scheduling sessions. Milo automatically generates a 7-day optimal routine that separates "encoding" tasks from "active retrieval" tasks, scaled perfectly to your focus limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-[32px] p-8 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 border-2 border-zinc-950 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">AI Syllabus Buddy</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                A warm, proactive AI study coach that understands your cognitive profile. Chat with Milo to review tough concepts, trigger Grind Mode for custom study sessions, and overcome friction.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-b-8 border-zinc-950 rounded-[32px] p-8 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 border-2 border-zinc-950 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Timer className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">Focus Telemetry Tracker</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                A sleek, distraction-free Pomodoro timer designed to track your actual active minutes. Log sessions to feed the engine data on what subjects require more of your attention.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-[#121214] text-zinc-400 shrink-0 z-20 py-16 px-6 font-semibold select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border-2 border-zinc-950">
                <Image src="/milo_mascot.png" alt="Milo Mascot" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-2xl font-black text-white">Milo</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm text-center md:text-left">
              The intelligent study coach powering the next generation of academic excellence.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <Link href="/welcome" className="hover:text-blue-500 transition-colors">Features</Link>
            <Link href="/welcome" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
            <Link href="/welcome" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
            <Link href="/welcome" className="hover:text-blue-500 transition-colors">Contact</Link>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Milo Learning Inc. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
