"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User, GraduationCap, BookOpen, Brain, Zap, Clock,
  Star, TrendingUp, LogOut, RotateCcw, Edit3, Check,
  X, ChevronRight, Shield, Sparkles, Target, Battery
} from "lucide-react";
import {
  analyzeStudyPatterns,
  getSessionsFromStorage,
  getSubjectsFromStorage,
  type StudyPattern,
} from "@/lib/study-patterns";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [pattern, setPattern] = useState<StudyPattern | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Profile data
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearSem, setYearSem] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  // Editable copies
  const [editName, setEditName] = useState("");
  const [editUni, setEditUni] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editYearSem, setEditYearSem] = useState("");

  // Cognitive profile
  const [focusCapacity, setFocusCapacity] = useState("");
  const [energyRhythm, setEnergyRhythm] = useState("");
  const [processingStyle, setProcessingStyle] = useState("");
  const [frictionType, setFrictionType] = useState("");

  // Grind Mode states
  const [grindActive, setGrindActive] = useState(false);
  const [grindSubject, setGrindSubject] = useState("");
  const [grindTopic, setGrindTopic] = useState("");

  // Cognitive Engine states
  const [personaCard, setPersonaCard] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("milo_user_name") || "";
    const em = localStorage.getItem("milo_user_email") || "";
    const uni = localStorage.getItem("milo_user_uni") || "";
    const crs = localStorage.getItem("milo_user_course") || "";
    const ys = localStorage.getItem("milo_user_year_sem") || "";
    const subs = getSubjectsFromStorage();

    setUserName(name);
    setEmail(em);
    setUniversity(uni);
    setCourse(crs);
    setYearSem(ys);
    setSubjects(subs);

    setEditName(name);
    setEditUni(uni);
    setEditCourse(crs);
    setEditYearSem(ys);

    setFocusCapacity(localStorage.getItem("milo_focus_capacity") || "");
    setEnergyRhythm(localStorage.getItem("milo_energy_rhythm") || "");
    setProcessingStyle(localStorage.getItem("milo_processing_style") || "");
    setFrictionType(localStorage.getItem("milo_friction_type") || "");

    setGrindActive(localStorage.getItem("milo_grind_mode_active") === "true");
    setGrindSubject(localStorage.getItem("milo_grind_mode_subject") || "");
    setGrindTopic(localStorage.getItem("milo_grind_mode_topic") || "");

    const sessions = getSessionsFromStorage();
    const computed = analyzeStudyPatterns(sessions, subs);
    setPattern(computed);

    const savedPersona = localStorage.getItem("milo_persona_card");
    const savedTimetable = localStorage.getItem("milo_timetable");
    if (savedPersona) setPersonaCard(JSON.parse(savedPersona));
    if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
  }, []);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const payload = {
        goal: localStorage.getItem("milo_goal") || "long-term-mastery",
        priorKnowledge: localStorage.getItem("milo_prior_knowledge") || "intermediate",
        dominantHabit: localStorage.getItem("milo_dominant_habit") || "mix",
        metacognition: localStorage.getItem("milo_metacognition") || "moderately-calibrated",
        challenge: localStorage.getItem("milo_challenge") || "concentration",
        hoursPerWeek: localStorage.getItem("milo_hours_per_week") || "6-10",
        deadline: localStorage.getItem("milo_deadline") || "none",
        environment: localStorage.getItem("milo_environment") || "quiet",
        distraction: localStorage.getItem("milo_distraction") || "medium",
        motivation: localStorage.getItem("milo_motivation") || "intrinsic",
        focusStyle: localStorage.getItem("milo_focus_capacity") || "sprint",
        energyPeak: localStorage.getItem("milo_energy_rhythm") || "morning",
        processingStyle: localStorage.getItem("milo_processing_style") || "step-by-step",
        subjects: subjects.map((name, i) => ({ name, priority: i + 1, difficulty: "medium" })),
        neglectedSubjects: pattern?.neglectedSubjects.map(s => s.name) || []
      };

      const res = await fetch("/api/cognitive-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.personaCard) {
        setPersonaCard(data.personaCard);
        localStorage.setItem("milo_persona_card", JSON.stringify(data.personaCard));
      }
      if (data.timetable) {
        setTimetable(data.timetable);
        localStorage.setItem("milo_timetable", JSON.stringify(data.timetable));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem("milo_user_name", editName);
    localStorage.setItem("milo_user_uni", editUni);
    localStorage.setItem("milo_user_course", editCourse);
    localStorage.setItem("milo_user_year_sem", editYearSem);
    setUserName(editName);
    setUniversity(editUni);
    setCourse(editCourse);
    setYearSem(editYearSem);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(userName);
    setEditUni(university);
    setEditCourse(course);
    setEditYearSem(yearSem);
    setIsEditing(false);
  };

  const handleResetOnboarding = () => {
    // Clear all milo data from localStorage
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("milo_") || k.startsWith("study_") || k.startsWith("active_focus")
    );
    keys.forEach((k) => localStorage.removeItem(k));
    router.push("/welcome");
  };

  const handleSignOut = () => {
    // Clear everything and redirect to welcome
    localStorage.clear();
    router.push("/welcome");
  };

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "MI";

  const accentColors = [
    "from-indigo-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-blue-500 to-cyan-600",
  ];
  const accentGradient = accentColors[userName.length % accentColors.length];

  return (
    <div className="flex-grow flex-1 flex flex-col w-full h-full bg-[#fffdf9] dark:bg-[#0c0e17] text-foreground transition-colors duration-300 overflow-y-auto relative select-none pb-28">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border-b-4 border-zinc-950 px-4 py-3.5 shrink-0 flex items-center justify-between z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border-2 border-zinc-950 animate-float shrink-0">
            <Image src="/milo_mascot.png" alt="Milo" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <h1 className="text-xs font-black text-zinc-900 dark:text-white leading-none font-sans uppercase tracking-wider">
              Your Profile
            </h1>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest mt-1 block">
              Milo knows you
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 z-10">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all active:translate-y-[1px] cursor-pointer shadow-sm"
              title="Edit profile"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={handleSaveProfile}
                className="w-8 h-8 rounded-xl bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center hover:bg-emerald-400 transition-all active:translate-y-[1px] cursor-pointer shadow-sm"
                title="Save"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-8 h-8 rounded-xl bg-red-500 border-2 border-zinc-950 flex items-center justify-center hover:bg-red-400 transition-all active:translate-y-[1px] cursor-pointer shadow-sm"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Avatar & Name Card ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[24px] p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r opacity-20 rounded-t-[22px]" style={{ background: `linear-gradient(135deg, #14fac8, #6366f1)` }} />
          <div className="relative flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accentGradient} border-2 border-b-4 border-zinc-950 shadow-lg flex items-center justify-center text-white text-lg font-black shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm font-black text-zinc-900 dark:text-white bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your name"
                />
              ) : (
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                    {userName || "Scholar"}
                  </h2>
                  {personaCard && (
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mt-0.5">
                      {personaCard.name}
                    </span>
                  )}
                </div>
              )}
              {email && (
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{email}</p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Active Student
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Academic Info Card ──────────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-[#14fac8]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              Academic Details
            </span>
          </div>

          <div className="space-y-3">
            {/* University */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">University</span>
                {isEditing ? (
                  <input value={editUni} onChange={(e) => setEditUni(e.target.value)}
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full mt-0.5 focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">{university || "Not set"}</span>
                )}
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Course Program</span>
                {isEditing ? (
                  <input value={editCourse} onChange={(e) => setEditCourse(e.target.value)}
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full mt-0.5 focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">{course || "Not set"}</span>
                )}
              </div>
            </div>

            {/* Year/Semester */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Year / Semester</span>
                {isEditing ? (
                  <input value={editYearSem} onChange={(e) => setEditYearSem(e.target.value)}
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-full mt-0.5 focus:outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{yearSem || "Not set"}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Units / Subjects ────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              Enrolled Units
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {subjects.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {subjects.length > 0 ? subjects.map((s, i) => (
              <span
                key={i}
                className="bg-slate-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                {s}
              </span>
            )) : (
              <span className="text-[10px] text-zinc-400 italic">No units enrolled yet</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Grind Mode Profile Status ── */}
      <div className="px-4 pt-3 select-none">
        <div className={`border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md transition-all ${
          grindActive 
            ? "bg-red-50/40 dark:bg-red-950/15 border-red-500/30" 
            : "bg-white dark:bg-zinc-900 border-zinc-950"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-350 block">
                  Active Study Grind
                </span>
                <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 block">
                  {grindActive ? "Locked on custom concept" : "Currently disabled"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const nextActive = !grindActive;
                setGrindActive(nextActive);
                localStorage.setItem("milo_grind_mode_active", String(nextActive));
              }}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border border-zinc-950 shadow-sm transition-all cursor-pointer ${
                grindActive 
                  ? "bg-red-500 hover:bg-red-400 text-white" 
                  : "bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              {grindActive ? "Active" : "Enable"}
            </button>
          </div>

          {grindActive && (
            <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-950/20 space-y-2">
              <div className="flex flex-col gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-3 py-2">
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-widest">Grind Target</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                  {grindTopic || "Unspecified Topic"}
                </span>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                  In Unit: {grindSubject || "Unspecified Unit"}
                </span>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center gap-2 select-none">
                <span className="text-[8px] font-black text-red-600 dark:text-red-400 leading-normal">
                  Grind Mode synchronizes with the Socratic AI Coach and locks focus timers on this target.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Master Plan / Cognitive Engine ── */}
      <div className="px-4 pt-3 select-none">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                  Cognitive Master Plan
                </span>
                <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  AI-Optimized Strategy
                </span>
              </div>
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-zinc-950 shadow-sm transition-all cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white disabled:opacity-50"
            >
              {isGeneratingPlan ? "Generating..." : (personaCard ? "Regenerate" : "Generate Plan")}
            </button>
          </div>

          {personaCard && (
            <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <span className="text-[9px] font-black uppercase text-indigo-500 mb-1 block">Your Persona: {personaCard.name}</span>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {personaCard.description}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-zinc-500 block">Core Strategies</span>
                {personaCard.strategies.map((strategy: string, idx: number) => (
                  <div key={idx} className="flex gap-2 p-2 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <span className="text-emerald-500 text-xs">✔</span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{strategy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {timetable && timetable.length > 0 && (
            <div className="mt-5 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">7-Day Timetable</span>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {timetable.map((session: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md">
                          {session.day}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">
                        P{session.priority}
                      </span>
                    </div>
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 block mb-1.5">
                      {session.subject}
                    </span>
                    <div className="text-[9px] font-medium text-zinc-500 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-1.5 italic">
                      "{session.nudge}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cognitive Learning Profile ─────────────────────────────────────── */}
      {focusCapacity && (
        <div className="px-4 pt-3">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                Cognitive Learning Profile
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Battery className="w-3 h-3 text-orange-500" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">Focus Capacity</span>
                </div>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{focusCapacity}</span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Energy Rhythm</span>
                </div>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{energyRhythm}</span>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3 h-3 text-indigo-500" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Processing Style</span>
                </div>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{processingStyle}</span>
              </div>
              <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-red-500" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">Momentum Block</span>
                </div>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{frictionType}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Study Stats ────────────────────────────────────────────────────── */}
      {pattern && (
        <div className="px-4 pt-3">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                Study Statistics
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Mastery</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{pattern.overallMastery}/5</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Focus Score</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{pattern.overallFocusQuality}/100</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Study Streak</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{pattern.streakDays} days 🔥</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Sessions</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{pattern.totalSessions}</span>
                </div>
              </div>
            </div>

            {/* Coaching insight */}
            {pattern.coachingInsights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Milo&apos;s Insight</span>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {pattern.coachingInsights[0]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-4">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[20px] overflow-hidden shadow-md">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Reset Onboarding</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">Re-setup your semester units &amp; profile</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 block">Sign Out</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">Clear all data &amp; return to welcome</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
          </button>
        </div>
      </div>

      {/* ── Reset Confirmation Modal ───────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[24px] p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/20 border-2 border-amber-500 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">Reset Onboarding?</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">This will clear your profile</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed mb-4">
              Your study sessions and chat history will be cleared. You&apos;ll go through the onboarding flow again to set up your semester.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 text-xs font-black text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetOnboarding}
                className="flex-1 py-2.5 rounded-2xl bg-amber-500 border-2 border-zinc-950 border-b-4 text-xs font-black text-white hover:bg-amber-400 active:translate-y-[2px] active:border-b-2 transition-all cursor-pointer shadow-md"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 flex items-center justify-center gap-1.5 select-none">
        <User className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
        <span className="text-[8px] text-zinc-300 dark:text-zinc-600 font-black uppercase tracking-wider">
          Milo · Your cognitive study partner
        </span>
      </div>
    </div>
  );
}
