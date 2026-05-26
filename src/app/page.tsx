"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Moon, Sun, Award, Sparkles, CheckCircle2, GraduationCap, MapPin, Percent, Globe, BookOpen, AlertTriangle, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import {
  analyzeStudyPatterns,
  getSessionsFromStorage,
  type StudyPattern,
} from "@/lib/study-patterns";

export default function TodayPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Onboarding Profile state loaded from session
  const [userName, setUserName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearSem, setYearSem] = useState("");
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  
  // Cognitive Assessment profile metrics
  const [focusCapacity, setFocusCapacity] = useState("");
  const [energyRhythm, setEnergyRhythm] = useState("");
  const [processingStyle, setProcessingStyle] = useState("");
  const [frictionType, setFrictionType] = useState("");
  
  // Active date selection state (Wed 14 is default)
  const [selectedDate, setSelectedDate] = useState("14");

  // Track checkmarks pop state (local storage or local states)
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [studyPattern, setStudyPattern] = useState<StudyPattern | null>(null);

  // Grind Mode states
  const [grindActive, setGrindActive] = useState(false);
  const [grindSubject, setGrindSubject] = useState("");
  const [grindTopic, setGrindTopic] = useState("");

  // Redirect to welcome/onboarding if not onboarded yet
  useEffect(() => {
    const savedName = localStorage.getItem("milo_user_name");
    const savedSubjects = localStorage.getItem("milo_active_subjects");
    
    if (!savedName || !savedSubjects) {
      router.push("/welcome");
      return;
    }

    setUserName(savedName);
    setUniversity(localStorage.getItem("milo_user_uni") || "University of Nairobi");
    setCourse(localStorage.getItem("milo_user_course") || "B.Sc. Computer Science");
    setYearSem(localStorage.getItem("milo_user_year_sem") || "Year 2 - Semester 1");
    const parsedSubjects = JSON.parse(savedSubjects) as string[];
    const activeCourse = localStorage.getItem("milo_user_course") || "B.Sc. Computer Science";
    let finalSubjects = parsedSubjects;
    if (activeCourse.toLowerCase().includes("nursing")) {
      const cleaned = parsedSubjects.filter(s => s !== "Introduction to Programming" && s !== "Calculus I");
      if (cleaned.length !== parsedSubjects.length) {
        localStorage.setItem("milo_active_subjects", JSON.stringify(cleaned));
        finalSubjects = cleaned;
      }
    }
    setSubjectsList(finalSubjects);

    // Load Grind Mode
    const grindModeActive = localStorage.getItem("milo_grind_mode_active") === "true";
    setGrindActive(grindModeActive);
    setGrindSubject(localStorage.getItem("milo_grind_mode_subject") || "");
    setGrindTopic(localStorage.getItem("milo_grind_mode_topic") || "");

    // Load Cognitive Metrics
    setFocusCapacity(localStorage.getItem("milo_focus_capacity") || "");
    setEnergyRhythm(localStorage.getItem("milo_energy_rhythm") || "");
    setProcessingStyle(localStorage.getItem("milo_processing_style") || "");
    setFrictionType(localStorage.getItem("milo_friction_type") || "");

    // Compute study pattern for nudge banner
    const sessions = getSessionsFromStorage();
    const computed = analyzeStudyPatterns(sessions, parsedSubjects);
    setStudyPattern(computed);
  }, [router]);

  // Dates data matching mockup capsule
  const dates = [
    { day: "Mon", date: "12" },
    { day: "Tue", date: "13" },
    { day: "Wed", date: "14" },
    { day: "Today", date: "15" },
    { day: "Fri", date: "16" },
  ];

  // Mascot mapping with fallback owl logo for custom subjects
  const getSubjectMascot = (subjectName: string) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("programming") || normal.includes("computing") || normal.includes("software")) return "/calculator_mascot.png";
    if (normal.includes("calculus") || normal.includes("math")) return "/calculator_mascot.png";
    if (normal.includes("economics") || normal.includes("econ")) return "/earth_mascot.png";
    if (normal.includes("geography") || normal.includes("geo")) return "/earth_mascot.png";
    if (normal.includes("chemistry") || normal.includes("chem")) return "/chemistry_mascot.png";
    if (normal.includes("physics") || normal.includes("phys")) return "/physics_mascot.png";
    return "/milo_mascot.png";
  };

  const getSubjectIcon = (subjectName: string) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("programming") || normal.includes("computing")) return BookOpen;
    if (normal.includes("math") || normal.includes("calculus")) return Percent;
    if (normal.includes("economics") || normal.includes("geography") || normal.includes("geo")) return Globe;
    return BookOpen;
  };

  const getSubjectColors = (subjectName: string, index: number) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("math") || normal.includes("calculus") || normal.includes("physics")) {
      return {
        accentHex: "#f85c5c",
        dotColor: "bg-[#f85c5c]",
        textColor: "text-[#f85c5c]",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500"
      };
    }
    if (normal.includes("geography") || normal.includes("geo") || normal.includes("chemistry") || normal.includes("economics") || normal.includes("econ")) {
      return {
        accentHex: "#10b981",
        dotColor: "bg-[#10b981]",
        textColor: "text-[#10b981]",
        badgeBg: "bg-emerald-600",
        leftBorder: "border-l-[5px] border-l-emerald-600"
      };
    }
    
    // Fallbacks
    if (index % 2 === 0) {
      return {
        accentHex: "#6366f1",
        dotColor: "bg-indigo-500",
        textColor: "text-indigo-500 dark:text-indigo-400",
        badgeBg: "bg-indigo-600",
        leftBorder: "border-l-[5px] border-l-indigo-600"
      };
    } else {
      return {
        accentHex: "#8b5cf6",
        dotColor: "bg-violet-500",
        textColor: "text-violet-500 dark:text-violet-400",
        badgeBg: "bg-violet-600",
        leftBorder: "border-l-[5px] border-l-violet-600"
      };
    }
  };

  const compileTimeline = () => {
    if (subjectsList.length === 0) return [];
    
    const dateOffset = parseInt(selectedDate) - 12; // 0 for Mon 12, etc.
    
    const subjectA = subjectsList[dateOffset % subjectsList.length];
    const subjectB = subjectsList[(dateOffset + 1) % subjectsList.length];

    if (!subjectA) return [];

    const blocks = [
      {
        id: `block-1-${selectedDate}`,
        subject: subjectA,
        time: "10:00 AM",
        task: `${subjectA} active review and quiz recap session.`,
        ...getSubjectColors(subjectA, 0),
        mascot: getSubjectMascot(subjectA),
        icon: getSubjectIcon(subjectA)
      }
    ];

    if (subjectB && subjectB !== subjectA) {
      blocks.push({
        id: `block-2-${selectedDate}`,
        subject: subjectB,
        time: "11:30 AM",
        task: `${subjectB} syllabus mastery drill.`,
        ...getSubjectColors(subjectB, 1),
        mascot: getSubjectMascot(subjectB),
        icon: getSubjectIcon(subjectB)
      });
    }

    return blocks;
  };

  const activeSchedules = compileTimeline();

  const handleCardClick = (subjectName: string) => {
    localStorage.setItem("active_focus_subject", subjectName);
    router.push("/focus");
  };

  const toggleCheckmark = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening focus timer on checkmark toggle
    setCompletedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  if (!userName) {
    return (
      <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">
      
      {/* Top Header Navigation */}
      <div className="bg-white dark:bg-zinc-900 border-b-4 border-zinc-950 px-6 pt-6 pb-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => router.push("/welcome")}>
          <span className="text-2xl font-black text-zinc-800 dark:text-white flex items-center gap-1 font-heading tracking-tight">
            <span className="bg-blue-600 border-2 border-b-4 border-zinc-950 text-white rounded-xl px-2 py-0.5 animate-float flex items-center justify-center min-w-7">M</span>
            <span className="bg-indigo-600 border-2 border-b-4 border-zinc-950 text-white rounded-xl px-2 py-0.5 animate-float-delayed flex items-center justify-center min-w-4">i</span>
            <span className="bg-violet-600 border-2 border-b-4 border-zinc-950 text-white rounded-xl px-2 py-0.5 animate-float flex items-center justify-center min-w-4">l</span>
            <span className="bg-emerald-600 border-2 border-b-4 border-zinc-950 text-white rounded-xl px-2 py-0.5 animate-float-delayed flex items-center justify-center min-w-7">o</span>
            <span className="text-[9px] bg-slate-100 dark:bg-zinc-850 border-2 border-zinc-950 text-zinc-800 dark:text-zinc-300 rounded-xl px-2.5 py-0.5 font-black uppercase tracking-wider ml-1 rotate-6 inline-block">
              Uni
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
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
          
          {/* Profile Trigger */}
          <button 
            onClick={() => router.push("/onboarding")}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 hover:border-blue-500 flex items-center justify-center shadow-sm transition-all active:scale-95 group cursor-pointer"
            title="Profile details"
          >
            <Award className="w-5 h-5 text-blue-600 dark:text-[#14fac8] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Neglect Nudge Banner */}
      {studyPattern && studyPattern.neglectedSubjects.length > 0 && (
        <div className="px-6 mt-4 shrink-0 animate-scale-in">
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-400 border-b-4 rounded-[20px] px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                Milo Alert: You haven&apos;t studied{" "}
                <span className="underline">{studyPattern.neglectedSubjects[0].name}</span> in{" "}
                {studyPattern.neglectedSubjects[0].daysSinceLastStudy} days — memory decay has started!
              </p>
              <p className="text-[9px] text-amber-600/70 dark:text-amber-500/70 font-semibold mt-0.5">
                A 20-min review session today will reset your forgetting curve.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Every Page Mascot Speech Bubble Guidance (Mascot Integration) */}
      <div className="px-6 mt-5 shrink-0 select-none animate-scale-in">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[24px] p-3 shadow-md relative">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
            <Image src="/milo_mascot.png" alt="Milo timeline coach" width={40} height={40} className="object-contain" />
          </div>
          <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span className="text-blue-600 dark:text-[#14fac8] block uppercase tracking-wider mb-0.5">Milo Coach:</span>
            {focusCapacity 
              ? `"Ready to optimize? Since you are a ${processingStyle} who studies best as a ${energyRhythm}, I've tailored today's lessons specifically to your mind!"`
              : `"Sasa ${userName}! Here is your spaced study plan. Tap any module card to trigger the study timer and log active minutes!"`}
          </div>
        </div>
      </div>

      {/* Cognitive Assessment Prompt Banner if uncompleted */}
      {!focusCapacity && (
        <div className="px-6 mt-4 shrink-0 animate-scale-in">
          <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 border-b-6 border-zinc-950 rounded-[24px] p-4 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-wiggle">
              <Image src="/milo_mascot.png" alt="Milo Coach" width={38} height={38} className="object-contain" />
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Unlock Personalization</span>
              <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
                Take the 1-minute **Cognitive Assessment** to adapt my teaching models to your learning style!
              </p>
              <button
                onClick={() => router.push("/assessment")}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 border-2 border-b-3 border-zinc-950 text-[10px] font-black text-zinc-950 hover:-translate-y-0.5 active:translate-y-[1px] active:border-b-2 transition-all cursor-pointer inline-flex items-center gap-1"
              >
                🚀 Discover Your Brain Style <ArrowRight className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Profile Banner */}
      <div className="px-6 mt-5 shrink-0 animate-scale-in">
        <div className="bg-white dark:bg-zinc-900 border-2 border-b-6 border-zinc-950 rounded-[28px] p-4 shadow-md text-zinc-800 dark:text-white flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Scholar</span>
              <h3 className="text-sm font-black text-blue-600 dark:text-[#14fac8] leading-none mt-0.5">{userName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Term State</span>
              <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">{yearSem}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold select-none">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              {course}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              {university}
            </span>
          </div>

          {focusCapacity && (
            <div className="mt-2.5 pt-2.5 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5 select-none items-center">
              <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900/50">
                {focusCapacity}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-900/50">
                {energyRhythm}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/50">
                {processingStyle}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                {frictionType}
              </span>
              
              <button 
                onClick={() => router.push("/assessment?mode=retake")}
                className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center gap-1 active:translate-y-[1px] transition-all ml-auto"
                title="Retake Cognitive Assessment"
              >
                <RefreshCw className="w-2.5 h-2.5 shrink-0" /> Retake
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Grind Mode Dashboard Banner ─────────────────────────────────────── */}
      {grindActive ? (
        <div className="px-6 mt-5 shrink-0 animate-scale-in">
          <div className="bg-red-50 dark:bg-red-950/15 border-2 border-red-500 border-b-6 border-zinc-950 rounded-[28px] p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2 select-none">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🔥</span>
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Grind Mode Active
                </span>
              </div>
              <button
                onClick={() => {
                  setGrindActive(false);
                  localStorage.setItem("milo_grind_mode_active", "false");
                  window.location.reload();
                }}
                className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                Disable
              </button>
            </div>
            
            <h3 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
              Mastering: <span className="text-red-500">{grindTopic || "Custom Topic"}</span>
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold mt-1.5 uppercase tracking-widest block select-none">
              Unit: {grindSubject || "Custom Unit"}
            </p>

            <div className="flex gap-2.5 mt-4 select-none">
              <button
                onClick={() => router.push("/buddy")}
                className="flex-1 h-10 rounded-xl bg-zinc-950 text-white text-[10px] font-black uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-md active:translate-y-[2px] cursor-pointer"
              >
                💬 Chat with Buddy
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("active_focus_subject", grindSubject);
                  router.push("/focus");
                }}
                className="flex-1 h-10 rounded-xl bg-[#14fac8] hover:bg-[#1efdd0] text-zinc-950 border-2 border-zinc-950 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:translate-y-[2px] cursor-pointer"
              >
                ⏱️ Start Focus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 mt-5 shrink-0 animate-scale-in select-none">
          <div className="bg-slate-50 dark:bg-zinc-900/40 border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-zinc-950 rounded-[28px] p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 p-2 border-2 border-zinc-950 flex items-center justify-center shrink-0">
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 leading-tight">Need a custom study session?</h4>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">Enable Grind Mode to drill on any custom unit and topic.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/buddy")}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border-2 border-zinc-950 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm cursor-pointer"
            >
              Setup
            </button>
          </div>
        </div>
      )}

      {/* Study Plan Section Header */}
      <div className="px-6 mt-6 shrink-0 flex items-center justify-between select-none">
        <div>
          <h2 className="text-3xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-50">Study Plan</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">Click a card to launch the focus timer.</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-[#14fac8] bg-blue-50 dark:bg-[#14fac8]/10 border border-blue-100 dark:border-[#14fac8]/20 px-2.5 py-1 rounded-full animate-pulse-glow shadow-sm">
          <Sparkles className="w-3 h-3" />
          ACTIVE
        </div>
      </div>

      {/* Date Selector */}
      <div className="px-6 mt-4 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 justify-between items-center py-2 min-w-max">
          {dates.map((d) => {
            const isToday = d.day === "Today";
            const isSelected = selectedDate === d.date || (selectedDate === "14" && d.date === "14");
            
            let dateStyle = "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border-2 border-b-4 border-zinc-950";
            if (isToday) {
              dateStyle = "bg-blue-600 text-white border-2 border-b-4 border-zinc-950 shadow-sm";
            } else if (isSelected && d.day !== "Today") {
              dateStyle = "bg-blue-50 text-blue-600 border-2 border-b-4 border-zinc-950 dark:bg-zinc-800 dark:text-[#14fac8] dark:border-zinc-950 shadow-sm";
            }

            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center w-14 h-18 rounded-2xl transition-all duration-150 select-none hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer ${dateStyle}`}
              >
                <span className="text-[10px] font-black block uppercase tracking-tight opacity-75">{d.day}</span>
                <span className="text-lg font-black mt-0.5 leading-none">{d.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Study Timeline & Tactile Cards */}
      <div className="px-6 mt-8 flex-1 flex flex-col justify-start">
        {activeSchedules.length > 0 ? (
          <div className="flex flex-col space-y-5 relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2 animate-scale-in">
            {activeSchedules.map((item, index) => {
              const IconComp = item.icon;
              const isCompleted = !!completedBlocks[item.id];

              return (
                <div 
                  key={item.id} 
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline node dot */}
                  <div className={`absolute top-5 -left-[32px] w-3 h-3 rounded-full ${item.dotColor} border-2 border-zinc-950 shadow-md z-10`} />

                  {/* Playful tactile card with 3D shadow boundaries */}
                  <div
                    onClick={() => handleCardClick(item.subject)}
                    className={`bg-white dark:bg-[#18181b] border-2 border-zinc-950 border-b-6 border-b-zinc-950 rounded-[28px] p-5 cursor-pointer hover:-translate-y-0.5 hover:border-b-8 hover:shadow-md active:translate-y-1 active:border-b-2 transition-all duration-150 flex flex-col gap-3 relative overflow-hidden group select-none ${item.leftBorder} ${isCompleted ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Badge Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${item.badgeBg} shadow-sm shrink-0 border-2 border-zinc-950`}>
                        <IconComp className="w-4 h-4 stroke-[3.5]" />
                      </div>
                      
                      <h3 className={`text-lg font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isCompleted ? "line-through" : ""}`}>
                        {item.subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 pl-11 pr-16">
                      {/* Tactile popping checkmark checkbox */}
                      <div 
                        onClick={(e) => toggleCheckmark(item.id, e)}
                        className="w-6 h-6 rounded-xl border-2 border-zinc-950 border-b-4 border-zinc-950 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner cursor-pointer"
                        title="Toggle Completion"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pop-in stroke-[3]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-zinc-200 dark:text-zinc-800 transition-colors hover:text-zinc-400 stroke-[2.5]" />
                        )}
                      </div>
                      
                      {/* Descriptor */}
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-tight truncate flex-1 leading-none">
                        {item.task}
                      </p>
                    </div>

                    {/* Mascot Sticker on the right (wiggles continuously on hover) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-50 dark:bg-zinc-800 border-2 border-zinc-950 p-1.5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all">
                      <Image 
                        src={item.mascot} 
                        alt={item.subject} 
                        width={44} 
                        height={44} 
                        className="object-contain animate-float"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-[#14fac8] mb-3 opacity-60" />
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500">No study blocks scheduled.</p>
            <p className="text-xs text-zinc-500 mt-1">Enjoy a healthy break, or select another date.</p>
          </div>
        )}
      </div>

    </div>
  );
}
