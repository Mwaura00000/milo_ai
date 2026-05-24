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

  // Nairobi collegiate greetings matching active mascot
  const getWelcomeGreeting = (sub: string) => {
    const name = sub.trim().toLowerCase();
    if (name.includes("math")) {
      return "Sasa! I am your Mathematics buddy. I saw you studied Algebra recently. Uko ready for a quick brain check, or should we review standard formulas? Let's smash this!";
    }
    if (name.includes("geography") || name.includes("geo")) {
      return "Sasa! Geography Coach here. Global Ecosystems is actually very simple once we split it into biomes. Want a quick interactive quiz to lock in the knowledge?";
    }
    if (name.includes("physics") || name.includes("phys")) {
      return "Sasa! Physics buddy in the building. Let's make sense of those tricky wave equations. Ready to try a fast quiz, or should we break down kinetic mechanics?";
    }
    if (name.includes("chemistry") || name.includes("chem")) {
      return "Sasa! Chemistry Coach activated. Organic reactions can look like a maze, but they have clear patterns. Shall we do a quick stoichiometry mock session?";
    }
    // Fallback dialogue for custom dynamic subjects
    return `Sasa! I am your active Milo coach for ${sub}. Let's break down this university unit together and master it step-by-step. Ready for a quick adaptive quiz, or do you have a tough lecture slide concept to discuss?`;
  };

  // Sync mascot when active subject changes
  useEffect(() => {
    const name = activeSubject.trim().toLowerCase();
    let chosenMascot = "/milo_mascot.png"; // Fallback mascot

    if (name.includes("math")) {
      chosenMascot = "/calculator_mascot.png";
    } else if (name.includes("geography") || name.includes("geo")) {
      chosenMascot = "/earth_mascot.png";
    } else if (name.includes("physics") || name.includes("phys")) {
      chosenMascot = "/physics_mascot.png";
    } else if (name.includes("chemistry") || name.includes("chem")) {
      chosenMascot = "/chemistry_mascot.png";
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
      
      {/* Subject Selector Bar */}
      <div className="bg-[#121214] border-b border-zinc-800/80 px-4 py-3 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Active Mascot Avatar Header */}
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center border border-zinc-700 animate-float">
            <Image src={mascot} alt="Mascot" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-none flex items-center gap-1.5">
              Buddy Coach
            </h1>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5 block">AI Study Assistant</span>
          </div>
        </div>

        {/* Dynamic Subject Select Options loaded from user onboarding subjects */}
        <select 
          value={activeSubject}
          onChange={(e) => setActiveSubject(e.target.value)}
          className="text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#14fac8]"
        >
          {subjectsList.map((subName) => (
            <option key={subName} value={subName}>{subName} Coach</option>
          ))}
        </select>
      </div>

      {/* Chat Messages Log Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
        <div className="space-y-4 pb-12">
          {messages.map((m, mIndex) => {
            const isUser = m.role === "user";
            return (
              <div key={mIndex} className={`flex gap-3 animate-scale-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar Icon */}
                {!isUser ? (
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-sm shrink-0 flex items-center justify-center p-1 relative overflow-hidden self-end">
                    <Image src={mascot} alt="Mascot" width={24} height={24} className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-md shrink-0 flex items-center justify-center text-[10px] font-black text-white self-end uppercase">
                    You
                  </div>
                )}

                {/* Message Bubble Frame */}
                <div className="flex flex-col space-y-2 max-w-[82%]">
                  
                  {/* Standard text content */}
                  {m.content && (
                    <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium shadow-sm border ${
                      isUser 
                        ? "bg-indigo-600 text-white border-indigo-500 rounded-br-none" 
                        : "bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200 border-zinc-200/50 dark:border-zinc-800/80 rounded-bl-none"
                    }`}>
                      {m.content}
                    </div>
                  )}

                  {/* Interactive Gamified Quiz Card */}
                  {m.quiz && (
                    <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-md max-w-sm w-full animate-scale-in">
                      <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-[#14fac8] uppercase mb-2">
                        <BrainCircuit className="w-3.5 h-3.5" />
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

                          let btnStyle = "bg-slate-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800";
                          if (isAnswered) {
                            if (isSelected) {
                              btnStyle = isCorrect 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                                : "bg-red-500/20 border-red-500 text-red-400 font-bold";
                            } else if (isCorrect) {
                              btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400/80";
                            } else {
                              btnStyle = "opacity-40 bg-slate-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500";
                            }
                          }

                          return (
                            <button
                              key={oIndex}
                              disabled={isAnswered}
                              onClick={() => handleAnswerQuiz(mIndex, oIndex)}
                              className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] transition-all flex items-center justify-between gap-2 active:scale-98 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              {isAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quiz Explanations Section */}
                      {m.quiz.userAnswer !== undefined && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 animate-slide-up flex gap-2">
                          <AlertCircle className="w-4 h-4 text-[#14fac8] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#14fac8] block">Buddy Explanation:</span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-400 font-semibold mt-0.5 leading-relaxed">
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
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-sm shrink-0 flex items-center justify-center p-1 relative overflow-hidden self-end">
                <Image src={mascot} alt="Mascot" width={24} height={24} className="object-contain" />
              </div>
              <div className="bg-white dark:bg-[#121214] border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 self-end">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14fac8] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#14fac8] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#14fac8] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Message panel */}
      <div className="absolute bottom-16 left-4 right-4 bg-transparent shrink-0 z-20">
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-2 flex items-center gap-2">
          <Input
            placeholder={`Ask your ${activeSubject} buddy...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent border-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0 px-2 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 h-9"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-xl bg-[#14fac8] text-[#070a13] flex items-center justify-center hover:bg-[#12dda2] transition-colors active:scale-95 shadow-md"
            title="Send Message"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

    </div>
  );
}
