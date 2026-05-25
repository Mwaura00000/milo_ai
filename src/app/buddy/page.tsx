"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { BrainCircuit, Send, Check, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "assistant" | "user";
  content: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    userAnswer?: number;
  };
}

export default function BuddyPage() {
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [mascot, setMascot] = useState("/calculator_mascot.png");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Dynamic subjects loading
  useEffect(() => {
    const saved = localStorage.getItem("milo_active_subjects");
    if (saved) {
      const list = JSON.parse(saved) as string[];
      setSubjectsList(list);
      if (list.length > 0) {
        setActiveSubject(list[0]);
      }
    } else {
      setSubjectsList(["Mathematics", "Geography", "Physics", "Chemistry"]);
    }
  }, []);

  // Nairobi collegiate greetings matching active mascot (updated to match university modules)
  const getWelcomeGreeting = (sub: string) => {
    const name = sub.trim().toLowerCase();
    if (name.includes("programming") || name.includes("computing") || name.includes("software")) {
      return "Sasa! Introduction to Programming Coach activated. I saw you studied dynamic programming recently. Ready for a quick multiple-choice code quiz, or should we review standard syntax? Let's smash this!";
    }
    if (name.includes("calculus") || name.includes("math")) {
      return "Sasa! Calculus I buddy in the building. Let's make sense of those tricky limits and derivatives. Ready to try a fast quiz, or should we break down integrals?";
    }
    if (name.includes("economics") || name.includes("econ")) {
      return "Sasa! Economics 101 Coach here. Supply and demand curves are actually very simple once we split them into market equilibria. Want a quick interactive quiz to lock in the knowledge?";
    }
    if (name.includes("communication") || name.includes("skills")) {
      return "Sasa! Communication Skills Coach activated. Let's master citation systems and active listening filters. Shall we do a quick mock session?";
    }
    // Fallback dialogue for custom dynamic subjects
    return `Sasa! I am your active Milo coach for ${sub}. Let's break down this university unit together and master it step-by-step. Ready for a quick adaptive quiz, or do you have a tough lecture slide concept to discuss?`;
  };

  // Sync mascot when active subject changes
  useEffect(() => {
    const name = activeSubject.trim().toLowerCase();
    let chosenMascot = "/milo_mascot.png"; // Fallback mascot

    if (name.includes("programming") || name.includes("computing") || name.includes("software")) {
      chosenMascot = "/calculator_mascot.png";
    } else if (name.includes("calculus") || name.includes("math")) {
      chosenMascot = "/calculator_mascot.png";
    } else if (name.includes("economics") || name.includes("econ")) {
      chosenMascot = "/earth_mascot.png";
    } else if (name.includes("communication") || name.includes("skills")) {
      chosenMascot = "/milo_mascot.png";
    }

    setMascot(chosenMascot);

    // Initial greeting
    setMessages([
      {
        role: "assistant",
        content: getWelcomeGreeting(activeSubject)
      }
    ]);
  }, [activeSubject]);


  // Scroll to bottom when messages list changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulated chatbot reply with a structured explanation or a quiz trigger!
    setTimeout(() => {
      setIsTyping(false);
      let replyContent = "";
      let quizData = undefined;

      const lower = input.toLowerCase();
      if (lower.includes("quiz") || lower.includes("test") || lower.includes("try") || lower.includes("ready")) {
        replyContent = "Awesome! Here is your adaptive quiz prompt. Let's see how well you recall this concept:";
        
        // Custom quiz schemas based on subject
        const name = activeSubject.trim().toLowerCase();
        if (name.includes("math")) {
          quizData = {
            question: "Solve for x: 3x - 7 = 5x + 9",
            options: ["x = 8", "x = -8", "x = 1", "x = -1"],
            correctIndex: 1,
            explanation: "Subtract 3x from both sides: -7 = 2x + 9. Subtract 9 from both sides: -16 = 2x. Divide by 2: x = -8. Excellent math work!"
          };
        } else if (name.includes("geography") || name.includes("geo")) {
          quizData = {
            question: "Which biome is characterized by low rainfall, extremely high daytime temperatures, and succulent plants like cacti?",
            options: ["Tundra", "Tropical Rainforest", "Desert", "Savannah"],
            correctIndex: 2,
            explanation: "Deserts receive minimal precipitation (< 25cm/year), leading to extreme temperature fluctuations and specialized drought-resistant plants. You got it!"
          };
        } else if (name.includes("physics") || name.includes("phys")) {
          quizData = {
            question: "Which of the following colors of visible light has the shortest wavelength?",
            options: ["Red", "Green", "Yellow", "Violet"],
            correctIndex: 3,
            explanation: "Violet light has the shortest wavelength in the visible spectrum (~400nm) and the highest energy frequency. Great work!"
          };
        } else if (name.includes("chemistry") || name.includes("chem")) {
          quizData = {
            question: "What is the pH level of a completely neutral aqueous solution at 25°C?",
            options: ["pH 1", "pH 7", "pH 14", "pH 0"],
            correctIndex: 1,
            explanation: "A neutral solution like pure water has a pH of exactly 7, balance of hydrogen ions and hydroxide ions. Brilliant chemistry knowledge!"
          };
        } else {
          // Dynamic quiz fallback for dynamic custom subjects!
          quizData = {
            question: `In university-level study of ${activeSubject}, which study method yields the highest spaced repetition retention rates?`,
            options: ["Passive re-reading of slides", "Active recall and custom mock drills", "Highlighter coloring", "Cramming the night before"],
            correctIndex: 1,
            explanation: "Active recall combined with spaced repetition is statistically verified as the most efficient study model for long-term memory retrieval. Perfect logic!"
          };
        }
      } else {
        replyContent = `That's a very solid question about ${activeSubject}! In university modules, keeping track of these key formulas and definitions is crucial. If you ever feel stuck, type 'quiz' to test your knowledge!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyContent,
          quiz: quizData
        }
      ]);
    }, 1500);
  };

  const handleAnswerQuiz = (messageIndex: number, optionIndex: number) => {
    setMessages((prev) => {
      const copy = [...prev];
      if (copy[messageIndex] && copy[messageIndex].quiz) {
        copy[messageIndex].quiz!.userAnswer = optionIndex;
      }
      return copy;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#070a13] text-foreground transition-colors duration-300 overflow-hidden pb-24 relative">
      {/* Subject Selector Bar with Gamified Tactile Header */}
      <div className="bg-[#121214] border-b-2 border-zinc-800/80 px-4 py-4 shrink-0 flex items-center justify-between z-10 relative overflow-hidden">
        {/* Decorative Grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="flex items-center gap-2 z-10">
          {/* Active Mascot Avatar Header with Duolingo-style sticker frame */}
          <div className="w-11 h-11 rounded-full bg-white p-1 shadow-md flex items-center justify-center border-2 border-b-4 border-zinc-300 dark:border-zinc-700 animate-float shrink-0">
            <Image src={mascot} alt="Mascot" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-none flex items-center gap-1.5 font-sans">
              Buddy Coach
            </h1>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mt-1 block">AI Study Assistant</span>
          </div>
        </div>

        {/* Dynamic Subject Select Options loaded from user onboarding subjects */}
        <select 
          value={activeSubject}
          onChange={(e) => setActiveSubject(e.target.value)}
          className="text-xs font-black bg-zinc-900 border-2 border-zinc-800 border-b-4 border-b-zinc-950 text-zinc-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer transition-all active:translate-y-[2px] active:border-b-2 select-none z-10"
        >
          {subjectsList.map((subName) => (
            <option key={subName} value={subName}>{subName} Coach</option>
          ))}
        </select>
      </div>

      {/* Chat Messages Log Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar dot-grid-bg-light dark:dot-grid-bg bg-slate-50 dark:bg-[#070a13] z-0">
        <div className="space-y-6 pb-12">
          {messages.map((m, mIndex) => {
            const isUser = m.role === "user";
            return (
              <div key={mIndex} className={`flex gap-3 animate-scale-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar Icon */}
                {!isUser ? (
                  <div className="w-9 h-9 rounded-full bg-white border-2 border-b-4 border-zinc-200 dark:border-zinc-800 shadow-md shrink-0 flex items-center justify-center p-1.5 relative overflow-hidden self-end select-none">
                    <Image src={mascot} alt="Mascot" width={28} height={28} className="object-contain" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-b-4 border-blue-800 shadow-md shrink-0 flex items-center justify-center text-[10px] font-black text-white self-end uppercase select-none">
                    You
                  </div>
                )}

                {/* Message Bubble Frame */}
                <div className="flex flex-col space-y-2 max-w-[80%]">
                  
                  {/* Speech bubble custom styles */}
                  {m.content && (
                    <div className={`px-4 py-3 text-xs leading-relaxed font-semibold shadow-md ${
                      isUser 
                        ? "rounded-[24px] bg-blue-600 border-2 border-blue-600 border-b-6 border-b-blue-800 text-white rounded-br-none font-black shadow-blue-500/10" 
                        : "speech-bubble-left bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200 rounded-bl-none"
                    }`}>
                      {m.content}
                    </div>
                  )}

                  {/* Interactive Gamified Quiz Card */}
                  {m.quiz && (
                    <div className="bg-white dark:bg-[#121214] border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-250 dark:border-b-zinc-900 rounded-[28px] p-5 shadow-lg max-w-sm w-full animate-scale-in select-none">
                      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-emerald-600 dark:text-[#14fac8] uppercase mb-2">
                        <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                        ADAPTIVE DRILL
                      </div>

                      <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 leading-snug mb-3">
                        {m.quiz.question}
                      </h4>

                      {/* Options buttons */}
                      <div className="space-y-2">

                        {m.quiz.options.map((opt, oIndex) => {
                          const isAnswered = m.quiz?.userAnswer !== undefined;
                          const isSelected = m.quiz?.userAnswer === oIndex;
                          const isCorrect = m.quiz?.correctIndex === oIndex;

                          let btnStyle = "bg-slate-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-b-zinc-300 dark:border-b-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-850";
                          if (isAnswered) {
                            if (isSelected) {
                              btnStyle = isCorrect 
                                ? "bg-emerald-500/20 border-emerald-500 border-b-emerald-600 text-emerald-400 font-bold"
                                : "bg-red-500/20 border-red-500 border-b-red-600 text-red-400 font-bold";
                            } else if (isCorrect) {
                              btnStyle = "bg-emerald-500/10 border-emerald-500/40 border-b-emerald-600/40 text-emerald-400/80";
                            } else {
                              btnStyle = "opacity-45 bg-slate-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-b-zinc-300 text-zinc-500";
                            }
                          }

                          return (
                            <button
                              key={oIndex}
                              disabled={isAnswered}
                              onClick={() => handleAnswerQuiz(mIndex, oIndex)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-2xl border-2 border-b-4 text-xs transition-all flex items-center justify-between gap-2 active:translate-y-[2px] active:border-b-2 active:scale-[0.99] cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />}
                              {isAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-red-400 shrink-0 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quiz Explanations Section */}
                      {m.quiz.userAnswer !== undefined && (
                        <div className="mt-3 pt-3 border-t-2 border-zinc-100 dark:border-zinc-800/80 animate-slide-up flex gap-2">
                          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-[#14fac8] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#14fac8] block">Buddy Explanation:</span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                              {m.quiz.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Chat Typing Animation */}
          {isTyping && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-white border-2 border-b-4 border-zinc-200 shadow-md shrink-0 flex items-center justify-center p-1.5 relative overflow-hidden self-end select-none">
                <Image src={mascot} alt="Mascot" width={28} height={28} className="object-contain" />
              </div>
              <div className="speech-bubble-left bg-white dark:bg-[#121214] rounded-bl-none px-4 py-3.5 flex items-center gap-1.5 self-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#14fac8] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#14fac8] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#14fac8] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Message panel with tactile adjustments */}
      <div className="absolute bottom-16 left-4 right-4 bg-transparent shrink-0 z-20 select-none">
        <div className="bg-white dark:bg-[#121214] border-2 border-zinc-200 dark:border-zinc-800 border-b-6 border-b-zinc-200/60 dark:border-b-zinc-950 shadow-lg rounded-[24px] p-2 flex items-center gap-2">
          <Input
            placeholder={`Ask your ${activeSubject} buddy...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent border-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 h-9 font-semibold text-zinc-900 dark:text-zinc-150"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-2xl bg-[#14fac8] border-2 border-[#14fac8] border-b-4 border-b-[#0ca986] text-[#070a13] flex items-center justify-center hover:bg-[#1efdd0] active:border-b-0 active:translate-y-[4px] transition-all shadow-md cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>


    </div>
  );
}
