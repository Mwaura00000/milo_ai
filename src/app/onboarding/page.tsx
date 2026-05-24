"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Plus, ArrowRight, UserPlus, Sparkles, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Academic Level
  const [academicLevel, setAcademicLevel] = useState<"university" | "high_school">("university");

  // Step 2: University details
  const [university, setUniversity] = useState("University of Nairobi (UoN)");
  const [customUniversity, setCustomUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("Year 1");
  const [semester, setSemester] = useState("Semester 1");

  // Dynamic Units Builder
  const [predefinedUnits, setPredefinedUnits] = useState([
    { name: "Mathematics", active: true },
    { name: "Geography", active: true },
    { name: "Physics", active: false },
    { name: "Chemistry", active: false },
  ]);
  const [customUnitInput, setCustomUnitInput] = useState("");
  const [customUnits, setCustomUnits] = useState<string[]>([]);

  // Step 3: Auth credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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
    if (!email || !password || !name) {
      setErrorMsg("Please fill in all security fields.");
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

    const selectedUni = university === "Other" ? customUniversity : university;

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
                className={`border rounded-3xl p-5 cursor-pointer transition-all flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 relative overflow-hidden group ${
                  academicLevel === "university" 
                    ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-500/5 shadow-sm" 
                    : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/60"
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  academicLevel === "university" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm transition-colors ${
                    academicLevel === "university" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-white"
                  }`}>University Student</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-medium">Semester system, dynamic modular units, space repetition algorithms, and lecture note chunking.</p>
                </div>
              </div>

              <div 
                onClick={() => setAcademicLevel("high_school")}
                className={`border rounded-3xl p-5 cursor-pointer transition-all flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-white/5 relative overflow-hidden group ${
                  academicLevel === "high_school" 
                    ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-500/5" 
                    : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/60"
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  academicLevel === "high_school" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm transition-colors ${
                    academicLevel === "high_school" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-white"
                  }`}>High School Student</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-medium">Standardized term systems (8-4-4 & CBC), exam syllabus planners, and basic learning cycles.</p>
                </div>
                <span className="absolute top-3 right-3 text-[8px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  SOON
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
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
              
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Enrolled University</label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
                >
                  <option value="University of Nairobi (UoN)">University of Nairobi (UoN)</option>
                  <option value="Jomo Kenyatta University (JKUAT)">JKUAT University</option>
                  <option value="Kenyatta University (KU)">Kenyatta University (KU)</option>
                  <option value="Strathmore University">Strathmore University</option>
                  <option value="United States International University (USIU-A)">USIU-Africa</option>
                  <option value="Egerton University">Egerton University</option>
                  <option value="Other">Other (Type manual below)</option>
                </select>
              </div>

              {university === "Other" && (
                <div className="space-y-1 animate-slide-up">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Enter Institution Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Technical University of Kenya"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Degree / Course Major</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc. Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Year of Study</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-bold shadow-sm"
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
                    className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 font-bold shadow-sm"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="font-bold text-zinc-500 dark:text-zinc-400 block">Choose or Add Academic Units</label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedUnits.map((u, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleTogglePredefined(i)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                        u.active
                          ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:border-[#14fac8] dark:text-[#14fac8] dark:bg-[#14fac8]/5"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300"
                      }`}
                    >
                      {u.name} {u.active ? "✓" : "+"}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add manual unit... (e.g. History)"
                    value={customUnitInput}
                    onChange={(e) => setCustomUnitInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomUnit())}
                    className="flex-1 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUnit}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95 shadow-sm"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>

                {customUnits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 max-h-24 overflow-y-auto no-scrollbar shadow-inner">
                    {customUnits.map((cu) => (
                      <span
                        key={cu}
                        className="inline-flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-sm animate-scale-in"
                      >
                        {cu}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomUnit(cu)}
                          className="text-red-500 hover:text-red-400 transition-colors ml-1 font-bold"
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
                className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide shadow-md transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                Setup Security
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Security & Supabase Auth Register */}
        {step === 3 && (
          <form onSubmit={handleFormSubmit} className="space-y-5 animate-scale-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Security Access</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Secure your active collegiate database coach.</p>
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
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
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
