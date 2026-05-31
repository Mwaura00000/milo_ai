"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Plus, ArrowRight, UserPlus, Sparkles, Check, ArrowLeft, Lock, Eye, EyeOff, LogIn, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { COURSE_UNITS_REGISTRY, GLOBAL_STANDARD_UNITS } from "@/lib/kenya-course-units";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSignIn, setIsSignIn] = useState(false);

  // Read mode from query param on mount safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signin") {
        setIsSignIn(true);
      }
    }
  }, []);

  // Step 1: Academic Level
  const [academicLevel, setAcademicLevel] = useState<"university" | "high_school">("university");

  // Step 2: University details
  const [university, setUniversity] = useState("University of Nairobi (UoN)");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [year, setYear] = useState("Year 1");
  const [semester, setSemester] = useState("Semester 1");

  // Dynamic Units Builder
  const [predefinedUnits, setPredefinedUnits] = useState([
    { name: "Unit 1", active: true },
    { name: "Unit 2", active: true },
    { name: "Unit 3", active: false },
    { name: "Unit 4", active: false },
  ]);

  const [customUnitInput, setCustomUnitInput] = useState("");
  const [customUnits, setCustomUnits] = useState<string[]>([]);

  // Automatically populate customUnits with default units when a course is chosen
  useEffect(() => {
    if (course) {
      const defaultUnits = COURSE_UNITS_REGISTRY[course] || GLOBAL_STANDARD_UNITS;
      setCustomUnits(defaultUnits);
    }
  }, [course]);

  // Path A state: Dropzone & Upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Path B state: Autocomplete & Selection
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [autocompleteSearch, setAutocompleteSearch] = useState("");

  // Step 3: Auth credentials
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

  // Sign In submit handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Sync mock fallback profiles for display if Supabase profile lacks details
      const userEmail = data.user?.email || email;
      const userName = userEmail.split("@")[0].toUpperCase();
      const userId = data.user?.id;

      if (userId) {
        // Query profile from database
        const { data: profile } = await supabase.from("profiles").select().eq("id", userId).single();
        if (profile) {
          localStorage.setItem("milo_user_uni", profile.university || "University of Nairobi");
          localStorage.setItem("milo_user_course", profile.course || "B.Sc. Computer Science");
          localStorage.setItem("milo_user_year_sem", `${profile.year || "Year 1"} - ${profile.semester || "Semester 1"}`);
          localStorage.setItem("milo_user_name", profile.name || userName);
          if (profile.focus_capacity) localStorage.setItem("milo_focus_capacity", profile.focus_capacity);
          if (profile.energy_rhythm) localStorage.setItem("milo_energy_rhythm", profile.energy_rhythm);
          if (profile.processing_style) localStorage.setItem("milo_processing_style", profile.processing_style);
          if (profile.friction_type) localStorage.setItem("milo_friction_type", profile.friction_type);
        } else {
          localStorage.setItem("milo_user_name", userName);
          localStorage.setItem("milo_user_uni", "University of Nairobi");
          localStorage.setItem("milo_user_course", "Undergraduate");
          localStorage.setItem("milo_user_year_sem", "Year 1 - Semester 1");
        }

        // Query subjects from database
        const { data: subjects } = await supabase.from("subjects").select().eq("user_id", userId);
        if (subjects && subjects.length > 0) {
          const subNames = subjects.map((s: any) => s.name);
          localStorage.setItem("milo_active_subjects", JSON.stringify(subNames));
        } else {
          const fallbackCourse = profile?.course || "Undergraduate";
          const fallbackUnits = COURSE_UNITS_REGISTRY[fallbackCourse]?.slice(0, 4) || GLOBAL_STANDARD_UNITS.slice(0, 4);
          localStorage.setItem("milo_active_subjects", JSON.stringify(fallbackUnits));
        }
      } else {
        localStorage.setItem("milo_user_name", userName);
        localStorage.setItem("milo_user_uni", "University of Nairobi");
        localStorage.setItem("milo_user_course", "Undergraduate");
        localStorage.setItem("milo_user_year_sem", "Year 1 - Semester 1");
        localStorage.setItem("milo_active_subjects", JSON.stringify(GLOBAL_STANDARD_UNITS.slice(0, 4)));
      }

      router.push("/");
    } catch (err: any) {
      setErrorMsg("An unexpected auth connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register submit handler
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

    const finalSubjectsList = Array.from(new Set(customUnits));

    if (finalSubjectsList.length === 0) {
      setIsLoading(false);
      setErrorMsg("Please add or select at least one study subject.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            academic_level: academicLevel,
            university,
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
      localStorage.setItem("milo_user_uni", university);
      localStorage.setItem("milo_user_course", course || "University Modules");
      localStorage.setItem("milo_user_year_sem", `${year} - ${semester}`);
      
      router.push("/assessment");
    } catch (err: any) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderBack = () => {
    if (isSignIn) {
      router.push("/welcome");
    } else if (step === 1) {
      router.push("/welcome");
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFile = async (file: File) => {
    setUploadedFileName(file.name);
    setUploadLoading(true);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const mimeType = file.type || "image/jpeg";

        const response = await fetch("/api/extract-units", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64Data, mimeType }),
        });

        const data = await response.json();

        if (!response.ok || !data.units || !Array.isArray(data.units) || data.units.length === 0) {
          // Non-fatal: let the user add units manually
          setErrorMsg("Could not auto-extract units from your file. Please add your semester units manually below.");
          setUploadedFileName("");
          setUploadLoading(false);
          return;
        }

        setCustomUnits(data.units);
        setErrorMsg("");
      } catch (err) {
        console.error("Live vision module extraction failed:", err);
        setCustomUnits([]);
        setErrorMsg("Sorry, the document text recognition failed to read your image. Please add your units manually below.");
      } finally {
        setUploadLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
      setUploadLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };


  return (
    <div className="min-h-screen bg-[#fffdf9] dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100 flex flex-col justify-start items-center p-6 font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 dark:bg-teal-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-600/15 blur-[100px] pointer-events-none" />

      {/* Header back navigation block */}
      <header className="w-full max-w-md flex items-center justify-between py-5 z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleHeaderBack}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white transition-all active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3.5]" />
          </button>
          
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => router.push("/welcome")}>
            <div className="w-8 h-8 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-zinc-950">
              <Image src="/milo_mascot.png" alt="Milo Owl" width={22} height={22} className="object-contain" />
            </div>
            <span className="text-base font-black text-zinc-900 dark:text-white">
              Milo Coach
            </span>
          </div>
        </div>
        
        <div className="text-[10px] font-black bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-2xl uppercase tracking-wider shadow-sm">
          {isSignIn ? "Login Access" : `Step ${step} of 3`}
        </div>
      </header>

      {/* Mascot Speech Bubble Guidance at top of card (Every Page Mascot Integration) */}
      <div className="w-full max-w-md flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-b-4 border-zinc-950 rounded-2xl p-3 shadow-md mb-6 z-10 select-none">
        <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-zinc-800 border border-zinc-950 p-1 flex items-center justify-center shrink-0 animate-float shadow-inner">
          <Image src="/milo_mascot.png" alt="Milo Assistant" width={36} height={36} className="object-contain" />
        </div>
        <div className="speech-bubble-left bg-slate-50 dark:bg-zinc-950 flex-1 p-2 rounded-xl border border-zinc-950 text-left font-bold text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {isSignIn && "Habari! Welcome back to Milo. Sign in with your school credentials to sync your active focus timers!"}
          {!isSignIn && step === 1 && "Choose your curriculum model so I can configure spaced calculations and syllabus modules."}
          {!isSignIn && step === 2 && "Awesome! Choose your Kenyan university and major units so we can sync custom mascost sticker logs."}
          {!isSignIn && step === 3 && "Let's secure your register profile! Milo will lock in your cognitive focus telemetry."}
          {!isSignIn && step === 4 && "Congratulations! Let's start capturing study logs and mastering university modules."}
        </div>
      </div>

      {/* Main Form chassis container */}
      <div className="w-full max-w-md bg-white dark:bg-[#121214] border-2 border-b-8 border-zinc-950 rounded-[36px] p-6 shadow-2xl z-10 flex flex-col relative transition-all duration-300">
        
        {/* SIGN IN VIEW */}
        {isSignIn ? (
          <form onSubmit={handleSignInSubmit} className="space-y-5 animate-scale-in">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Welcome Back</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Sign in to your intelligent study workspace.</p>
            </div>

            {/* Reactive Wiggling Owl Mascot */}
            <div className="flex flex-col items-center gap-2 pt-1 pb-1">
              <div className="relative w-18 h-18 bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-full flex items-center justify-center p-2 shadow-sm overflow-hidden animate-float">
                <Image 
                  src="/milo_mascot.png" 
                  alt="Milo Mascot" 
                  width={56} 
                  height={56} 
                  className={`object-contain transition-all duration-300 ${
                    password ? "scale-90 rotate-12" : "scale-100"
                  }`} 
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-xs font-black leading-relaxed flex gap-2 animate-shake">
                <span className="text-sm">!</span>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold select-none">
              <div className="space-y-1">
                <label className="text-zinc-500 dark:text-zinc-400 block">School Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. juma.jomo@student.uonbi.ac.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 dark:text-zinc-400 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account credentials"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl pl-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer select-none"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 stroke-[3]" /> Sign In & Launch
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setIsSignIn(false); setErrorMsg(""); }}
                className="w-full text-center text-xs font-black text-blue-600 dark:text-[#14fac8] hover:underline cursor-pointer py-1"
              >
                Don't have an account? Register instead
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION MULTI-STEP FLOW */
          <>
            {/* STEP 1: Academic level */}
            {step === 1 && (
              <div className="space-y-6 animate-scale-in">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Academic Stage</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Choose your current academic curriculum model.</p>
                </div>

                <div className="space-y-4 select-none">
                  <div 
                    onClick={() => setAcademicLevel("university")}
                    className={`rounded-[28px] p-5 cursor-pointer flex items-start gap-4 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5 relative overflow-hidden group ${
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
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black animate-scale-in border border-zinc-950 shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed font-semibold">Semester system, dynamic modular units, space repetition algorithms, and lecture note chunking.</p>
                    </div>
                  </div>

                  <div 
                    className="border-2 border-zinc-200/60 border-b-6 border-b-zinc-200/40 bg-zinc-50/20 dark:border-zinc-800/40 dark:border-b-zinc-800/20 dark:bg-zinc-900/20 rounded-[28px] p-5 relative overflow-hidden flex items-start gap-4 opacity-50 cursor-not-allowed transition-all duration-300 group"
                    title="Secondary school study planners are locked."
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
                      <p className="text-[10px] text-zinc-400/80 dark:text-zinc-500/80 mt-1 leading-relaxed font-semibold">CBC curriculum planners, scheduled exam review modules, and basic study checklists.</p>
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
            )}            {/* STEP 2: University Details & Units Conversational Onboarding */}
            {step === 2 && (
              <div className="space-y-5 animate-scale-in text-xs font-bold">
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-none">Configure Semester Units</h2>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">Choose a fast upload path or search standard modules dynamically.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-black leading-relaxed flex gap-2 animate-shake">
                    <span className="text-sm">!</span>
                    <p>{errorMsg}</p>
                  </div>
                )}

                {/* PATH A: THE MAGIC UPLOAD (Document Dropzone) */}
                <div className="space-y-2">
                  <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[9px] block text-left">Path A: Magic Upload</span>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload-input")?.click()}
                    className={`border-2 border-dashed rounded-[24px] p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 select-none min-h-28 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md"
                        : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-950/20"
                    }`}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {uploadLoading ? (
                      <div className="flex flex-col items-center gap-1.5 animate-pulse">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Parsing syllabus contents...</span>
                      </div>
                    ) : uploadedFileName ? (
                      <div className="flex flex-col items-center gap-1">
                        <Check className="w-6 h-6 text-emerald-500 stroke-[3.5] animate-scale-in" />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Accepted: {uploadedFileName.slice(0, 24)}...</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">Extracted {customUnits.length} course modules successfully!</span>
                      </div>
                    ) : (
                      <>
                        <Upload className={`w-6 h-6 stroke-[2.5] text-zinc-450 dark:text-zinc-500 ${isDragging ? "animate-bounce" : ""}`} />
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-450 font-black leading-snug">
                          Fastest: Drop your semester registration PDF or timetable here.
                        </p>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wide">Or click to select file</span>
                      </>
                    )}
                  </div>
                </div>

                {/* OR divider */}
                <div className="flex items-center gap-3 py-1 select-none">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* PATH B: SMART FORM - Units Selection Only */}
                <div className="space-y-4">
                  <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[9px] block text-left">Path B: Smart Manual Form</span>


                  {customUnits.length > 0 && (
                    <div className="space-y-1 text-left">
                      <label className="text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider text-[9px] mb-1">Selected Semester Units ({customUnits.length})</label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5 select-none">
                        {customUnits.map((u) => (
                          <Badge
                            key={u}
                            variant="secondary"
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-zinc-950 text-zinc-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-800 flex items-center gap-1.5 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-500 hover:text-red-500 group shadow-sm rounded-xl"
                          >
                            <span>{u}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomUnit(u)}
                              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors"
                            >
                              <X className="w-2.5 h-2.5 stroke-[3.5]" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart Multi-Select Autocomplete Selector */}
                  <div className="space-y-1.5 text-left relative">
                    <label className="text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider text-[9px]">Autocomplete Unit Selector</label>
                    <Popover open={isAutocompleteOpen} onOpenChange={setIsAutocompleteOpen}>
                      <PopoverTrigger
                        type="button"
                        className="w-full h-11 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-400 dark:text-zinc-500 rounded-2xl px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm text-xs text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>Type to search standard units...</span>
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 border-2 border-zinc-950 rounded-2xl bg-white dark:bg-zinc-900 shadow-md">
                        <Command className="rounded-2xl">
                          <CommandInput
                            placeholder="Type to filter units (e.g. Intro...)"
                            value={autocompleteSearch}
                            onValueChange={setAutocompleteSearch}
                            className="h-9 font-semibold text-xs"
                          />
                          <CommandList className="max-h-48 overflow-y-auto no-scrollbar">
                            <CommandEmpty className="font-semibold text-zinc-500 p-3 text-center text-[11px]">No matching suggested units found.</CommandEmpty>
                            <CommandGroup heading={course ? `Suggested for ${course}` : "Standard Suggested Units"}>
                              {(COURSE_UNITS_REGISTRY[course] || GLOBAL_STANDARD_UNITS)
                                .filter(u => u.toLowerCase().includes(autocompleteSearch.toLowerCase()))
                                .map((unit) => (
                                  <CommandItem
                                    key={unit}
                                    value={unit}
                                    onSelect={() => {
                                      if (!customUnits.includes(unit)) {
                                        setCustomUnits(prev => [...prev, unit]);
                                      }
                                      setAutocompleteSearch("");
                                      setIsAutocompleteOpen(false);
                                    }}
                                    className="cursor-pointer font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 p-2 rounded-lg text-zinc-800 dark:text-zinc-200"
                                  >
                                    {unit}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Custom Unit Manual Input */}
                  <div className="space-y-1.5 text-left relative">
                    <label className="text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider text-[9px]">Or add a custom unit manually</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. History of East Africa"
                        value={customUnitInput}
                        onChange={(e) => setCustomUnitInput(e.target.value)}
                        className="flex-1 h-11 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold text-xs shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUnitInput.trim()) {
                            if (!customUnits.includes(customUnitInput.trim())) {
                              setCustomUnits(prev => [...prev, customUnitInput.trim()]);
                            }
                            setCustomUnitInput("");
                          }
                        }}
                        className="px-4 h-11 bg-[#14fac8] hover:bg-[#1efdd0] border-2 border-zinc-950 text-zinc-950 font-black text-xs uppercase tracking-wide rounded-2xl transition-all shadow-sm active:translate-y-[2px] cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back and Continue Buttons */}
                <div className="flex gap-3 pt-3 select-none">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-300 dark:border-b-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer active:border-b-2 active:translate-y-[4px]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1 stroke-[3]" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customUnits.length === 0) {
                        setErrorMsg("Please add or upload at least one semester unit to proceed.");
                        return;
                      }
                      setErrorMsg("");
                      setStep(3);
                    }}
                    className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Lock In Details <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Register Credentials Auth Form */}
            {step === 3 && (
              <form onSubmit={handleFormSubmit} className="space-y-5 animate-scale-in">
                <div className="space-y-1 text-center">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-none">Register Account</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Create your student profile to sync study timetable.</p>
                </div>

                {/* Reactive cartoon mascot sticker */}
                <div className="flex flex-col items-center gap-1.5 pt-1 pb-1">
                  <div className="relative w-18 h-18 bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-full flex items-center justify-center p-2 shadow-sm overflow-hidden animate-float">
                    <Image 
                      src="/milo_mascot.png" 
                      alt="Milo Mascot" 
                      width={56} 
                      height={56} 
                      className={`object-contain transition-all duration-300 ${
                        password || confirmPassword ? "scale-90 rotate-12" : "scale-100"
                      }`} 
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-xs font-black leading-relaxed flex gap-2 animate-shake">
                    <span className="text-sm">!</span>
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold select-none">
                  <div className="space-y-1">
                    <label className="text-zinc-500 dark:text-zinc-400 block">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Juma Jomo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 dark:text-zinc-400 block">School Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. juma.jomo@student.uonbi.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl px-3 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 dark:text-zinc-400 block">Password Credentials</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl pl-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 dark:text-zinc-400 block">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-950 text-zinc-900 dark:text-white rounded-2xl pl-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all font-semibold shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 select-none">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="w-20 h-13 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-300 dark:border-b-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer active:border-b-2 active:translate-y-[4px]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1 stroke-[3]" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 stroke-[3]" /> Register & Launch
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsSignIn(true); setErrorMsg(""); }}
                  className="w-full text-center text-xs font-black text-blue-600 dark:text-[#14fac8] hover:underline cursor-pointer select-none py-1.5"
                >
                  Already have an account? Sign In instead
                </button>
              </form>
            )}

            {/* STEP 4: Success message celebration */}
            {step === 4 && (
              <div className="space-y-6 text-center animate-scale-in py-4">
                <div className="relative w-20 h-20 rounded-full bg-white p-2 border-2 border-zinc-950 shadow-md mx-auto flex items-center justify-center overflow-hidden animate-float">
                  <Image src="/milo_mascot.png" alt="Milo Mascot" width={80} height={80} className="object-contain animate-wiggle" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 dark:text-[#14fac8] bg-blue-50 dark:bg-[#14fac8]/10 border border-blue-100 dark:border-[#14fac8]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse-glow mx-auto shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Registration Complete
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">Welcome to Milo!</h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">
                    Milo is preparing study sessions and recall schedules for <span className="text-blue-600 dark:text-[#14fac8] font-black">{course || "your degree course"}</span> at <span className="text-zinc-900 dark:text-white font-black">{university}</span>.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-zinc-950 rounded-2xl p-3 flex items-center justify-center gap-2 w-fit mx-auto text-[10px] font-bold text-zinc-600 dark:text-zinc-400 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[3.5]" />
                  <span>Created timers for {customUnits.length} subjects</span>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 border-b-6 border-b-blue-800 active:border-b-2 active:translate-y-[4px] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  Start Studying Now
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
