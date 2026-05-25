"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Plus, ArrowRight, UserPlus, Sparkles, Check, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";


import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { KENYAN_UNIVERSITIES, UNIVERSITY_COURSES } from "@/lib/kenya-universities";



export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Academic Level
  const [academicLevel, setAcademicLevel] = useState<"university" | "high_school">("university");

  // Step 2: University details (Searchable & Autocomplete registries)
  const [university, setUniversity] = useState("University of Nairobi (UoN)");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [year, setYear] = useState("Year 1");
  const [semester, setSemester] = useState("Semester 1");


  // Dynamic Units Builder
  const [predefinedUnits, setPredefinedUnits] = useState([
    { name: "Introduction to Programming", active: true },
    { name: "Calculus I", active: true },
    { name: "Communication Skills", active: false },
    { name: "Economics 101", active: false },
  ]);

  const [customUnitInput, setCustomUnitInput] = useState("");
  const [customUnits, setCustomUnits] = useState<string[]>([]);

  // Step 3: Auth credentials (with password visibility toggle and confirm checks)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  // App states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTogglePredefined = (index: number) => {
    setPredefinedUnits(prev => {
      const copy = [...prev];
      copy[index].active = !copy[index].active;
      return copy;
    });
  };

  const handleAddCustomUnit = () => {
    if (!customUnitInput.trim()) return;
    if (customUnits.includes(customUnitInput.trim())) return;
    setCustomUnits(prev => [...prev, customUnitInput.trim()]);
    setCustomUnitInput("");
  };

  const handleRemoveCustomUnit = (unitName: string) => {
    setCustomUnits(prev => prev.filter(u => u !== unitName));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }


    setIsLoading(true);
    setErrorMsg("");

    const activePredefined = predefinedUnits.filter(u => u.active).map(u => u.name);
    const finalSubjectsList = Array.from(new Set([...activePredefined, ...customUnits]));

    if (finalSubjectsList.length === 0) {
      setIsLoading(false);
      setErrorMsg("Please add or select at least one study subject.");
      return;
    }

    const selectedUni = university;


    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            academic_level: academicLevel,
            university: selectedUni,
            course,
            year,
            semester,
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      const userId = data?.user?.id || "mock-user-uuid-123456";
      const subjectRecords = finalSubjectsList.map((subName, i) => ({
        id: `custom-sub-${i}-${Date.now()}`,
        name: subName,
        user_id: userId
      }));

      await supabase.from("subjects").insert(subjectRecords);

      localStorage.setItem("milo_active_subjects", JSON.stringify(finalSubjectsList));
      localStorage.setItem("milo_user_name", name);
      localStorage.setItem("milo_user_uni", selectedUni);
      localStorage.setItem("milo_user_course", course);
      localStorage.setItem("milo_user_year_sem", `${year} - ${semester}`);
      
      setStep(4);
    } catch (err: any) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Header dynamic Back Button handler (addresses back button feedback)
  const handleHeaderBack = () => {
    if (step === 1) {
      router.push("/welcome");
    } else {
      setStep(prev => prev - 1);
    }
  };

  const filteredUniversities = KENYAN_UNIVERSITIES.filter(uni => 
    uni.toLowerCase().includes(university.toLowerCase())
  );

  const filteredCourses = UNIVERSITY_COURSES.filter(c => 
    c.toLowerCase().includes(course.toLowerCase())
  );

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 dark:bg-teal-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-600/15 blur-[100px] pointer-events-none" />

      {/* Header with ArrowLeft Back Button */}
      <header className="w-full max-w-md flex items-center justify-between py-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleHeaderBack}
            className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-white p-1 shadow-sm flex items-center justify-center border border-zinc-200">
              <Image src="/milo_mascot.png" alt="Milo Owl Mascot" width={22} height={22} className="object-contain" />
            </div>
            <span className="text-base font-extrabold text-zinc-800 dark:text-white">
              Milo Coach
            </span>
          </div>
        </div>
        
        <div className="text-[10px] font-black bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm select-none">
          Step {step} of 3
        </div>
      </header>

      {/* Main Registration Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-2xl z-10 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* STEP 1: Academic Level Selector */}
        {step === 1 && (
          <div className="space-y-6 animate-scale-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Academic Stage</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Choose your current academic curriculum model.</p>
            </div>

             <div className="space-y-4">

              <div 
                onClick={() => setAcademicLevel("university")}
                className={`rounded-[28px] p-5 cursor-pointer flex items-start gap-4 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 relative overflow-hidden group select-none ${
                  academicLevel === "university" 
                    ? "border-2 border-blue-600 border-b-6 border-b-blue-700 bg-blue-50/20 dark:border-blue-500 dark:border-b-blue-600 dark:bg-blue-500/5 shadow-md" 
                    : "border-2 border-zinc-200 border-b-6 border-b-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:border-b-zinc-800/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6 border-2 border-b-4 ${
                  academicLevel === "university" 
                    ? "bg-blue-600 text-white border-blue-600 border-b-blue-800 shadow-sm" 
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 border-b-zinc-300 dark:border-zinc-800 dark:border-b-zinc-900"
                }`}>
                  <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-black text-sm transition-colors ${
                      academicLevel === "university" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-white"
                    }`}>University Student</h3>
                    {academicLevel === "university" && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black animate-scale-in border border-blue-600 border-b-2 border-b-blue-800">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">Semester system, dynamic modular units, space repetition algorithms, and lecture note chunking.</p>
                </div>
              </div>

              <div 
                className="border-2 border-zinc-200/60 border-b-6 border-b-zinc-200/40 bg-zinc-50/20 dark:border-zinc-800/40 dark:border-b-zinc-800/20 dark:bg-zinc-900/20 rounded-[28px] p-5 relative overflow-hidden flex items-start gap-4 opacity-50 cursor-not-allowed transition-all duration-300 group"
                title="Kenyan secondary school study planners are coming next semester!"
              >
                <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500 border-2 border-b-4 border-zinc-200 border-b-zinc-300 dark:border-zinc-800 dark:border-b-zinc-900 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                      High School Student
                      <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400/80 dark:text-zinc-500/80 mt-1 leading-relaxed font-semibold">Standardized term systems (8-4-4 & CBC), exam syllabus planners, and basic learning cycles.</p>
                </div>
                <span className="absolute top-3 right-3 text-[8px] font-extrabold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  SOON
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >

              Continue
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* STEP 2: University Details & Units */}
        {step === 2 && (
          <div className="space-y-5 animate-scale-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Course & Modules</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Let's capture your university enrollment profile.</p>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              
              <div className="space-y-1 relative">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Enrolled University</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or type university name..."
                    value={university}
                    onChange={(e) => {
                      setUniversity(e.target.value);
                      setIsUniDropdownOpen(true);
                    }}
                    onFocus={() => setIsUniDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsUniDropdownOpen(false), 200)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold shadow-sm"
                  />
                  {isUniDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-1.5 no-scrollbar animate-scale-in">
                      {filteredUniversities.length > 0 ? (
                        filteredUniversities.map((uni, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setUniversity(uni);
                              setIsUniDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                          >
                            {uni}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-zinc-400 font-semibold italic">
                          Type to create "{university}"...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Degree / Course Major</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or type degree major..."
                    value={course}
                    onChange={(e) => {
                      setCourse(e.target.value);
                      setIsCourseDropdownOpen(true);
                    }}
                    onFocus={() => setIsCourseDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsCourseDropdownOpen(false), 200)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold shadow-sm"
                  />
                  {isCourseDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-1.5 no-scrollbar animate-scale-in">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCourse(c);
                              setIsCourseDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                          >
                            {c}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-zinc-400 font-semibold italic">
                          Type to create "{course}"...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Year of Study</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-bold shadow-sm cursor-pointer"
                  >
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-bold shadow-sm cursor-pointer"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>


              <div className="space-y-1 pt-2">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Choose or Add Academic Units</label>
                
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {predefinedUnits.map((u, i) => {
                    // Map unit to mascot image path
                    let mascotSrc = "/milo_mascot.png";
                    if (u.name === "Introduction to Programming") mascotSrc = "/calculator_mascot.png";
                    if (u.name === "Calculus I") mascotSrc = "/calculator_mascot.png";
                    if (u.name === "Economics 101") mascotSrc = "/earth_mascot.png";


                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTogglePredefined(i)}
                        className={`py-2 px-3.5 rounded-2xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 hover:scale-[1.04] active:scale-[0.96] cursor-pointer shadow-sm ${
                          u.active
                            ? "border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/15 shadow-md font-black"
                            : "border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 p-0.5 flex items-center justify-center shrink-0">
                          <Image src={mascotSrc} alt={u.name} width={18} height={18} className="object-contain" />
                        </div>
                        <span>{u.name}</span>
                        <span className={`text-[10px] font-black shrink-0 ${u.active ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}>
                          {u.active ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add manual unit... (e.g. History)"
                    value={customUnitInput}
                    onChange={(e) => setCustomUnitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomUnit())}
                    className="flex-1 h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUnit}
                    className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-sm cursor-pointer"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>

                {customUnits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 max-h-32 overflow-y-auto no-scrollbar shadow-inner">
                    {customUnits.map((cu) => (
                      <span
                        key={cu}
                        className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white pl-2 pr-3 py-1.5 rounded-xl text-xs font-bold shadow-sm animate-scale-in"
                      >
                        <div className="w-4 h-4 rounded bg-slate-100 p-0.5 flex items-center justify-center">
                          <Image src="/milo_mascot.png" alt="Owl Mascot" width={14} height={14} className="object-contain" />
                        </div>
                        <span>{cu}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomUnit(cu)}
                          className="text-red-500 hover:text-red-400 transition-colors ml-1 font-black text-sm flex items-center justify-center cursor-pointer"
                          title="Remove unit"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}


              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-300 dark:border-b-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-all flex items-center justify-center cursor-pointer active:border-b-2 active:translate-y-[4px] select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                Register Account
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Security & Supabase Auth Register */}
        {step === 3 && (
          <form onSubmit={handleFormSubmit} className="space-y-5 animate-scale-in">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Register Account</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Create your student profile to sync your study timetable.</p>
            </div>

            {/* Reactive Cartoon Mascot Sticker */}
            <div className="flex flex-col items-center gap-2 pt-1 pb-2">
              <div className="relative w-20 h-20 bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center p-2.5 shadow-sm overflow-hidden animate-float">
                <Image 
                  src="/milo_mascot.png" 
                  alt="Milo Mascot" 
                  width={64} 
                  height={64} 
                  className={`object-contain transition-all duration-500 ${
                    password || confirmPassword ? "scale-[0.85] rotate-12" : "scale-100 hover:rotate-12"
                  }`} 
                />
              </div>
              <span className="text-[9px] font-black text-blue-600 dark:text-[#14fac8] uppercase tracking-wider animate-pulse-glow">
                {password || confirmPassword ? "🦉 Milo is locking in your credentials!" : "🦉 Milo is ready to create your account!"}
              </span>
            </div>


            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed animate-shake flex gap-2">
                <span className="text-sm font-black">!</span>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Juma Jomo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">School Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. juma.jomo@student.uonbi.ac.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Password Credentials</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer p-1"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-300 dark:border-b-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer active:border-b-2 active:translate-y-[4px] select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer select-none"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-[#070a13] dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[3]" /> Register & Launch
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* STEP 4: Celebration Success */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-scale-in py-4">
            <div className="relative w-24 h-24 rounded-full bg-white p-3.5 border-2 border-blue-600 dark:border-[#14fac8] shadow-[0_0_20px_rgba(37,99,235,0.1)] mx-auto flex items-center justify-center overflow-hidden animate-float">
              <Image src="/milo_mascot.png" alt="Milo Celebrates" width={80} height={80} className="object-contain" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 dark:text-[#14fac8] bg-blue-50 dark:bg-[#14fac8]/10 border border-blue-100 dark:border-[#14fac8]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse-glow mx-auto shadow-sm">
                <Sparkles className="w-3 h-3" />
                Registration Complete
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">Welcome to Milo!</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">
                Milo is preparing your dynamic study sessions and spaced repetition telemetry schedules for <span className="text-blue-600 dark:text-[#14fac8] font-black">{course || "your degree course"}</span> at <span className="text-zinc-900 dark:text-white font-black">{university}</span>.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-3 flex items-center justify-center gap-2 w-fit mx-auto text-[10px] font-bold text-zinc-600 dark:text-zinc-400 shadow-sm">
              <Check className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 shrink-0 stroke-[3]" />
              <span>Created schedules for {predefinedUnits.filter(u => u.active).length + customUnits.length} modules</span>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide shadow-md transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              Start Studying Now
            </button>
          </div>
        )}
      </div>




    </div>
  );
}
