"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, Star, Hourglass, Zap, Award, Calendar } from "lucide-react";

interface StudySession {
  subject: string;
  duration: number;
  actualMinutes: number;
  interruptions: number;
  mastery: number;
  timestamp: string;
}

export default function InsightsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [totalHours, setTotalHours] = useState(17.5);
  const [avgMastery, setAvgMastery] = useState(3.4);
  const [avgInterruptions, setAvgInterruptions] = useState(1.2);

  // Load sessions and dynamic subjects
  useEffect(() => {
    // Dynamic subjects
    const savedSubjects = localStorage.getItem("milo_active_subjects");
    if (savedSubjects) {
      setSubjectsList(JSON.parse(savedSubjects));
    } else {
      setSubjectsList(["Mathematics", "Geography", "Physics", "Chemistry"]);
    }

    // Sessions logs
    const logged = localStorage.getItem("study_sessions");
    if (logged) {
      const parsed = JSON.parse(logged) as StudySession[];
      setSessions(parsed.reverse()); // Show newest first
      
      // Recalculate stats dynamically
      let totalMinutes = 17.5 * 60;
      let totalMastery = 3.4 * 5;
      let totalInter = 1.2 * 5;
      
      parsed.forEach(s => {
        totalMinutes += s.actualMinutes;
        totalMastery += s.mastery;
        totalInter += s.interruptions;
      });

      const count = 5 + parsed.length;
      setTotalHours(Math.round((totalMinutes / 60) * 10) / 10);
      setAvgMastery(Math.round((totalMastery / count) * 10) / 10);
      setAvgInterruptions(Math.round((totalInter / count) * 10) / 10);
    }
  }, []);

  // Static mock focus telemetry
  const weeklyData = [
    { name: "Mon", hours: 2.5 },
    { name: "Tue", hours: 3.8 },
    { name: "Wed", hours: 1.5 },
    { name: "Thu", hours: 4.2 },
    { name: "Fri", hours: 2.0 },
    { name: "Sat", hours: 5.5 },
    { name: "Sun", hours: 1.0 },
  ];

  // Subject mascot fallback mapping
  const getSubjectMascot = (subjectName: string) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("math")) return "/calculator_mascot.png";
    if (normal.includes("geography") || normal.includes("geo")) return "/earth_mascot.png";
    if (normal.includes("physics") || normal.includes("phys")) return "/physics_mascot.png";
    if (normal.includes("chemistry") || normal.includes("chem")) return "/chemistry_mascot.png";
    return "/milo_mascot.png";
  };

  const getSubjectColorClass = (subjectName: string, index: number) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("math") || normal.includes("physics")) {
      return "bg-[#f85c5c]";
    }
    if (normal.includes("geography") || normal.includes("geo") || normal.includes("chemistry")) {
      return "bg-[#14fac8]";
    }
    if (index % 2 === 0) {
      return "bg-purple-500";
    }
    return "bg-blue-500";
  };

  const getSubjectRatingText = (index: number) => {
    // Alternate base values for visual realism
    const ratings = ["4.2/5", "3.8/5", "3.0/5", "4.5/5", "3.5/5"];
    return ratings[index % ratings.length];
  };

  const getSubjectWidthPct = (index: number) => {
    const widths = ["84%", "76%", "60%", "90%", "70%"];
    return widths[index % widths.length];
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#070a13] text-foreground transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">
      
      {/* Title */}
      <div className="px-6 pt-8 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none text-slate-800 dark:text-zinc-50">Insights</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">Your closed-loop learning telemetry.</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2.5 py-1 rounded-full animate-pulse-glow">
          <Sparkles className="w-3 h-3" />
          ANALYTICS
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 mt-6 grid grid-cols-3 gap-3 animate-scale-in">
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3 text-center text-white">
          <Hourglass className="w-4 h-4 text-[#14fac8] mx-auto mb-1" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Hours Focused</span>
          <span className="text-sm font-black text-[#14fac8]">{totalHours}h</span>
        </div>
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3 text-center text-white">
          <Star className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-amber-400/10" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Avg Mastery</span>
          <span className="text-sm font-black text-amber-400">{avgMastery}/5</span>
        </div>
        <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-3 text-center text-white">
          <Zap className="w-4 h-4 text-[#f85c5c] mx-auto mb-1" />
          <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Avg Interrupts</span>
          <span className="text-sm font-black text-[#f85c5c]">{avgInterruptions}</span>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        
        {/* Recharts Bar Chart Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-5 shadow-lg text-white animate-scale-in [animation-delay:100ms]">
          <h3 className="text-sm font-black tracking-wide text-zinc-300 mb-4 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#14fac8]" />
            Weekly Focus Minutes
          </h3>
          
          <div className="h-[180px] w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666", fontWeight: "bold" }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666" }} 
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid #333", 
                    backgroundColor: "#18181b",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }} 
                />
                <Bar 
                  dataKey="hours" 
                  fill="#14fac8" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Subject Mastery Checklist loading all dynamic subjects */}
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-5 shadow-lg text-white animate-scale-in [animation-delay:200ms]">
          <h3 className="text-sm font-black tracking-wide text-zinc-300 mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#f85c5c]" />
            Academic Mastery Levels
          </h3>

          <div className="space-y-4">
            {subjectsList.map((subName, index) => (
              <div key={subName} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-zinc-800">
                  <Image 
                    src={getSubjectMascot(subName)} 
                    alt={subName} 
                    width={28} 
                    height={28} 
                    className="object-contain animate-float" 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-[10px] font-bold">
                    <span>{subName}</span>
                    <span className="text-zinc-300">{getSubjectRatingText(index)}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getSubjectColorClass(subName, index)}`} 
                      style={{ width: getSubjectWidthPct(index) }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Study Logs feed */}
        {sessions.length > 0 && (
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-md animate-scale-in [animation-delay:300ms]">
            <h3 className="text-sm font-black tracking-wide mb-3 text-slate-800 dark:text-zinc-300">
              Live Session Activity
            </h3>
            
            <div className="space-y-3">
              {sessions.map((s, index) => (
                <div 
                  key={index} 
                  className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3 animate-slide-up"
                >
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center border border-zinc-200 shadow-sm">
                    <Image 
                      src={getSubjectMascot(s.subject)} 
                      alt="Mascot" 
                      width={32} 
                      height={32} 
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{s.subject}</span>
                      <span className="text-[9px] text-zinc-500 font-bold">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center text-[10px] text-zinc-400 font-bold mt-0.5">
                      <span>Focused: {s.actualMinutes}m</span>
                      <span className="text-zinc-600">•</span>
                      <span>Rating: {s.mastery}★</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[#f85c5c]">Alerts: {s.interruptions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
