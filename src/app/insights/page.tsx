"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Sparkles, Star, Hourglass, Zap, Award, Calendar,
  ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Brain,
  Flame, Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  analyzeStudyPatterns,
  getSessionsFromStorage,
  getSubjectsFromStorage,
  type StudyPattern,
} from "@/lib/study-patterns";

export default function InsightsPage() {
  const router = useRouter();
  const [pattern, setPattern] = useState<StudyPattern | null>(null);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ name: string; hours: number }[]>([]);

  useEffect(() => {
    const subjects = getSubjectsFromStorage();
    setSubjectsList(subjects);

    const sessions = getSessionsFromStorage();
    const computed = analyzeStudyPatterns(sessions, subjects);
    setPattern(computed);

    // Build real weekly chart data
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    sessions.forEach((s) => {
      const d = new Date(s.timestamp);
      const daysAgo = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        const dayName = dayNames[d.getDay()];
        dayMap[dayName] = (dayMap[dayName] || 0) + s.actualMinutes;
      }
    });

    // Add seed data if no sessions logged yet
    const hasData = sessions.length > 0;
    setWeeklyData([
      { name: "Mon", hours: hasData ? Math.round((dayMap.Mon / 60) * 10) / 10 : 2.5 },
      { name: "Tue", hours: hasData ? Math.round((dayMap.Tue / 60) * 10) / 10 : 3.8 },
      { name: "Wed", hours: hasData ? Math.round((dayMap.Wed / 60) * 10) / 10 : 1.5 },
      { name: "Thu", hours: hasData ? Math.round((dayMap.Thu / 60) * 10) / 10 : 4.2 },
      { name: "Fri", hours: hasData ? Math.round((dayMap.Fri / 60) * 10) / 10 : 2.0 },
      { name: "Sat", hours: hasData ? Math.round((dayMap.Sat / 60) * 10) / 10 : 5.5 },
      { name: "Sun", hours: hasData ? Math.round((dayMap.Sun / 60) * 10) / 10 : 1.0 },
    ]);
  }, []);

  const getSubjectMascot = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("programming") || n.includes("computing") || n.includes("math") || n.includes("calculus")) return "/calculator_mascot.png";
    if (n.includes("economics") || n.includes("econ") || n.includes("geography") || n.includes("geo")) return "/earth_mascot.png";
    if (n.includes("chemistry") || n.includes("chem")) return "/chemistry_mascot.png";
    if (n.includes("physics") || n.includes("phys")) return "/physics_mascot.png";
    return "/milo_mascot.png";
  };

  const totalHours = pattern ? Math.round((pattern.totalStudyMinutes / 60) * 10) / 10 : 0;
  const avgMastery = pattern?.overallMastery ?? 0;
  const focusScore = pattern?.overallFocusQuality ?? 0;

  // Spaced repetition schedule: next 5 days
  const srSchedule = pattern?.subjectStats
    .filter((s) => s.nextReviewDue !== null)
    .map((s) => {
      const due = s.nextReviewDue!;
      const now = new Date();
      const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...s, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5) ?? [];

  return (
    <div className="flex flex-col h-full bg-[#fffdf9] dark:bg-[#0c0e17] text-foreground transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">

      {/* Title */}
      <div className="px-6 pt-8 shrink-0 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-all active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3.5]" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none text-slate-800 dark:text-zinc-50 font-heading">Insights</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">Your closed-loop learning telemetry.</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 bg-[#121214] border-2 border-zinc-950 px-2.5 py-1.5 rounded-full animate-pulse-glow shadow-sm select-none">
          <Sparkles className="w-3 h-3" />
          ANALYTICS
        </div>
      </div>

      {/* Milo Speech Bubble */}
      <div className="px-6 mt-6 shrink-0 select-none animate-scale-in">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-[24px] p-3 shadow-md relative">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
            <Image src="/milo_mascot.png" alt="Milo coach" width={40} height={40} className="object-contain" />
          </div>
          <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span className="text-indigo-400 block uppercase tracking-wider mb-0.5">Milo Coach:</span>
            {pattern && pattern.totalSessions > 0
              ? pattern.coachingInsights[0] || `You've studied for ${totalHours}h total. Keep the streak going!`
              : "No sessions logged yet! Use the Focus Timer to start building your study intelligence profile."}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 mt-6 grid grid-cols-3 gap-3 animate-scale-in select-none">
        <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-2xl p-3 text-center text-white shadow-md">
          <Hourglass className="w-4 h-4 text-[#14fac8] mx-auto mb-1" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Hours Focused</span>
          <span className="text-sm font-black text-[#14fac8]">{totalHours}h</span>
        </div>
        <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-2xl p-3 text-center text-white shadow-md">
          <Star className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-amber-400/20" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Avg Mastery</span>
          <span className="text-sm font-black text-amber-400">{avgMastery > 0 ? avgMastery : "—"}{avgMastery > 0 ? "/5" : ""}</span>
        </div>
        <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-2xl p-3 text-center text-white shadow-md">
          <Zap className="w-4 h-4 text-[#f85c5c] mx-auto mb-1" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Focus Score</span>
          <span className="text-sm font-black text-[#f85c5c]">{focusScore > 0 ? `${focusScore}%` : "—"}</span>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">

        {/* Streak + Style card */}
        {pattern && pattern.totalSessions > 0 && (
          <div className="bg-gradient-to-br from-indigo-950 to-[#0c0e17] border-2 border-b-4 border-zinc-950 rounded-3xl p-5 shadow-lg text-white animate-scale-in select-none">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">Study Behaviour Analysis</h3>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-amber-400">{pattern.streakDays}</span>
              </div>
              <div>
                <span className="text-xs font-black text-white">Day Study Streak 🔥</span>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Keep going — memory consolidation peaks at day 7</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-[#14fac8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#14fac8] block mb-1">Recommended Study Style</span>
                  <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">{pattern.studyStyleRecommendation}</p>
                </div>
              </div>
            </div>
            {pattern.coachingInsights.slice(1).map((tip, i) => (
              <div key={i} className="mt-2 flex items-start gap-2 bg-white/5 rounded-2xl p-3 border border-white/10">
                <Target className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Bar Chart */}
        <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-3xl p-5 shadow-lg text-white animate-scale-in select-none">
          <h3 className="text-xs font-black tracking-wide text-zinc-350 mb-4 flex items-center gap-1.5 uppercase">
            <Calendar className="w-4 h-4 text-[#14fac8]" />
            Weekly Focus Hours
          </h3>
          <div className="h-[180px] w-full text-[10px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontWeight: "bold" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666" }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    borderRadius: "16px", border: "2px solid #000",
                    backgroundColor: "#18181b", boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    fontSize: "11px", fontWeight: "800"
                  }}
                  formatter={(value) => [`${value}h`, "Focus"]}
                />
                <Bar dataKey="hours" fill="#14fac8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Mastery — Real data */}
        <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-3xl p-5 shadow-lg text-white animate-scale-in select-none">
          <h3 className="text-xs font-black tracking-wide text-zinc-350 mb-4 flex items-center gap-1.5 uppercase">
            <Award className="w-4 h-4 text-[#f85c5c]" />
            Subject Mastery Levels
          </h3>
          <div className="space-y-4 font-bold">
            {(pattern?.subjectStats ?? subjectsList.map(n => ({ name: n, avgMastery: 0, totalMinutes: 0, sessionsCount: 0, trend: "no-data" as const, daysSinceLastStudy: null as number | null }))).map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border-2 border-zinc-950">
                  <Image src={getSubjectMascot(s.name)} alt={s.name} width={28} height={28} className="object-contain animate-float" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-[10px] font-black items-center">
                    <div className="flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {s.trend === "improving" && <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />}
                      {s.trend === "declining" && <TrendingDown className="w-2.5 h-2.5 text-red-400" />}
                    </div>
                    <span className="text-[#14fac8]">
                      {s.avgMastery > 0 ? `${s.avgMastery}/5` : "No data"}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 border border-zinc-950 shadow-inner">
                    <div
                      className={`h-1.5 rounded-full border border-black/10 transition-all duration-1000 ${
                        s.avgMastery >= 4 ? "bg-[#14fac8]" :
                        s.avgMastery >= 3 ? "bg-amber-400" :
                        s.avgMastery > 0 ? "bg-[#f85c5c]" : "bg-zinc-700"
                      }`}
                      style={{ width: s.avgMastery > 0 ? `${(s.avgMastery / 5) * 100}%` : "0%" }}
                    />
                  </div>
                  {s.sessionsCount > 0 && (
                    <p className="text-[8px] text-zinc-600 mt-0.5 font-semibold">
                      {s.sessionsCount} session{s.sessionsCount !== 1 ? "s" : ""} · {s.totalMinutes} min total
                      {s.daysSinceLastStudy !== null ? ` · ${s.daysSinceLastStudy}d ago` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced Repetition Schedule */}
        {srSchedule.length > 0 && (
          <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-3xl p-5 shadow-lg text-white animate-scale-in select-none">
            <h3 className="text-xs font-black tracking-wide text-zinc-350 mb-4 flex items-center gap-1.5 uppercase">
              <Brain className="w-4 h-4 text-indigo-400" />
              Spaced Repetition Schedule
            </h3>
            <p className="text-[9px] text-zinc-500 font-bold mb-3">When to review each subject for maximum retention:</p>
            <div className="space-y-2">
              {srSchedule.map((s) => {
                const isOverdue = s.daysUntil <= 0;
                const isDueSoon = s.daysUntil <= 1 && s.daysUntil > 0;
                return (
                  <div
                    key={s.name}
                    className={`flex items-center gap-3 rounded-2xl p-3 border ${
                      isOverdue ? "bg-red-900/20 border-red-800/50" :
                      isDueSoon ? "bg-amber-900/20 border-amber-800/50" :
                      "bg-zinc-900 border-zinc-800"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-zinc-700">
                      <Image src={getSubjectMascot(s.name)} alt={s.name} width={24} height={24} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-zinc-200">{s.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isOverdue && <AlertCircle className="w-2.5 h-2.5 text-red-400" />}
                        <span className={`text-[9px] font-bold ${isOverdue ? "text-red-400" : isDueSoon ? "text-amber-400" : "text-zinc-500"}`}>
                          {isOverdue ? "Overdue for review!" : isDueSoon ? "Review today!" : `Review in ${s.daysUntil} days`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-zinc-600 font-bold block">Mastery</span>
                      <span className={`text-xs font-black ${s.avgMastery < 3 ? "text-red-400" : "text-[#14fac8]"}`}>{s.avgMastery}/5</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No sessions CTA */}
        {(!pattern || pattern.totalSessions === 0) && (
          <div className="bg-[#121214] border-2 border-b-4 border-zinc-950 rounded-3xl p-6 shadow-lg text-center animate-scale-in select-none">
            <Image src="/milo_mascot.png" alt="Milo" width={56} height={56} className="object-contain mx-auto mb-3 animate-float" />
            <h3 className="text-sm font-black text-zinc-300 mb-1">No study data yet!</h3>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
              Use the Focus Timer to study a subject and log your session. Milo will start analysing your patterns immediately.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
