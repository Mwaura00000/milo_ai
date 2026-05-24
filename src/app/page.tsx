"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Moon, Sun, Award, Sparkles, CheckCircle2, GraduationCap, MapPin, Percent, Globe, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";

export default function TodayPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Onboarding Profile state loaded from session
  const [userName, setUserName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearSem, setYearSem] = useState("");
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  
  // Active date selection state (Wed 14 is default)
  const [selectedDate, setSelectedDate] = useState("14");

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
    setSubjectsList(JSON.parse(savedSubjects));
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
    if (normal.includes("math")) return "/calculator_mascot.png";
    if (normal.includes("geography") || normal.includes("geo")) return "/earth_mascot.png";
    if (normal.includes("physics") || normal.includes("phys")) return "/physics_mascot.png";
    if (normal.includes("chemistry") || normal.includes("chem")) return "/chemistry_mascot.png";
    return "/milo_mascot.png";
  };

  const getSubjectIcon = (subjectName: string) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("math")) return Percent;
    if (normal.includes("geography") || normal.includes("geo")) return Globe;
    return BookOpen;
  };

  const getSubjectColors = (subjectName: string, index: number) => {
    const normal = subjectName.trim().toLowerCase();
    if (normal.includes("math") || normal.includes("physics")) {
      return {
        accentHex: "#f85c5c",
        dotColor: "bg-[#f85c5c]",
        textColor: "text-[#f85c5c]",
        badgeBg: "bg-red-500",
        leftBorder: "border-l-[5px] border-l-red-500"
      };
    }
    if (normal.includes("geography") || normal.includes("geo") || normal.includes("chemistry")) {
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

  // Compile active dynamic timeline schedules based on enrolled subjects!
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

  if (!userName) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070a13] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#070a13] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 overflow-y-auto no-scrollbar pb-32">
      
      {/* Top Header Navigation */}
      <div className="bg-white dark:bg-[#121214] border-b border-zinc-150 dark:border-zinc-800/80 px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push("/welcome")}>
          <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700 animate-float">
            <Image src="/milo_mascot.png" alt="Milo Owl Logo" width={28} height={28} className="object-contain" />
          </div>
          <span className="text-xl font-extrabold text-zinc-800 dark:text-white flex items-center gap-1.5">
            Milo
            <span className="text-[10px] bg-blue-50 dark:bg-[#14fac8]/10 text-blue-600 dark:text-[#14fac8] border border-blue-100 dark:border-[#14fac8]/20 rounded-full px-2 py-0.5 font-black uppercase tracking-wider scale-90">
              Uni
            </span>
          </span>
        </div>

        {/* Top Right Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-all active:scale-95 group shadow-sm"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
          
          {/* Welcome Screen Profile Trigger */}
          <button 
            onClick={() => router.push("/onboarding")}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1d1d20] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-[#14fac8]/30 flex items-center justify-center shadow-sm transition-all active:scale-95 group"
            title="Profile details"
          >
            <Award className="w-5 h-5 text-blue-600 dark:text-[#14fac8] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Dynamic Profile Banner */}
      <div className="px-6 mt-5 shrink-0 animate-scale-in">
        <div className="bg-slate-50 dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm text-zinc-800 dark:text-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Scholar</span>
              <h3 className="text-sm font-black text-blue-600 dark:text-[#14fac8] leading-none mt-0.5">{userName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Term State</span>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{yearSem}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              {course}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              {university}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic header */}
      <div className="px-6 mt-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-50">Study Plan</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">Click a card to launch the focus timer.</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-[#14fac8] bg-blue-50 dark:bg-[#14fac8]/10 border border-blue-100 dark:border-[#14fac8]/20 px-2.5 py-1 rounded-full animate-pulse-glow">
          <Sparkles className="w-3 h-3" />
          ACTIVE
        </div>
      </div>

      {/* Date Selector exactly matching second screenshot */}
      <div className="px-6 mt-4 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 justify-between items-center py-2 min-w-max">
          {dates.map((d) => {
            const isToday = d.day === "Today";
            const isSelected = selectedDate === d.date || (selectedDate === "14" && d.date === "14");
            
            let dateStyle = "bg-slate-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800";
            if (isToday) {
              dateStyle = "bg-blue-600 text-white border-blue-600 shadow-sm";
            } else if (isSelected && d.day !== "Today") {
              dateStyle = "bg-blue-50 text-blue-600 border-blue-200 dark:bg-zinc-800 dark:text-[#14fac8] dark:border-[#14fac8]/40";
            }

            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center w-14 h-18 rounded-2xl transition-all duration-300 select-none hover:scale-105 active:scale-95 ${dateStyle}`}
              >
                <span className="text-[10px] font-bold block uppercase tracking-tight opacity-75">{d.day}</span>
                <span className="text-lg font-black mt-0.5 leading-none">{d.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Study Timeline & Dynamic White Cards matching second screenshot */}
      <div className="px-6 mt-8 flex-1 flex flex-col justify-start">
        
        {activeSchedules.length > 0 ? (
          <div className="flex flex-col space-y-5 relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-2 animate-scale-in">
            
            {activeSchedules.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.id} 
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline node dot */}
                  <div className={`absolute top-5 -left-[30px] w-3 h-3 rounded-full ${item.dotColor} border-2 border-white dark:border-[#070a13] shadow-md z-10`} />

                  {/* High-contrast solid white rounded card chassis */}
                  <div
                    onClick={() => handleCardClick(item.subject)}
                    className={`bg-white dark:bg-[#18181b] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col gap-3 relative overflow-hidden ${item.leftBorder}`}
                  >
                    
                    <div className="flex items-center gap-3">
                      {/* Left circular solid colored badge icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${item.badgeBg} shadow-sm shrink-0`}>
                        <IconComp className="w-4 h-4 stroke-[3.5]" />
                      </div>
                      
                      <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                        {item.subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 pl-11">
                      {/* Empty dynamic placeholder circles matching second screenshot */}
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
                      
                      {/* Dynamic module descriptor line */}
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-tight truncate flex-1">
                        {item.task}
                      </p>
                    </div>

                    {/* Miniature sticker mascot frame visible in dynamic layouts */}
                    <div className="absolute right-4 top-4 w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-1 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                      <Image 
                        src={item.mascot} 
                        alt={item.subject} 
                        width={28} 
                        height={28} 
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
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500">No active study blocks scheduled.</p>
            <p className="text-xs text-zinc-500 mt-1">Enjoy a healthy break, or check other dates.</p>
          </div>
        )}
      </div>

    </div>
  );
}
