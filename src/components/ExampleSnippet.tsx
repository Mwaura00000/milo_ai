"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, Check, Scale, Eye } from "lucide-react";

interface ExampleSnippetProps {
  concept: string;
  code: string;
  explanation: string;
}

export function ExampleSnippet({ concept, code, explanation }: ExampleSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy snippet text:", err);
    }
  };

  const isLawCase = code.toLowerCase().includes("v.") || code.toLowerCase().includes("court") || code.toLowerCase().includes("section");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-emerald-500 rounded-2xl p-4 shadow-md max-w-sm w-full relative overflow-hidden group select-none"
    >
      <div className="flex items-center justify-between gap-2 mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500 border border-zinc-950 flex items-center justify-center text-white animate-float shrink-0 shadow-sm">
            {isLawCase ? <Scale className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 dark:text-[#14fac8]">
            {isLawCase ? "Legal Case / Code Proof" : "Concrete Evidence Proof"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer text-zinc-400 dark:text-zinc-500 shrink-0"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-none font-sans mb-3 select-all">
        {concept}
      </h4>

      {/* Code Snippet / Terminal Box */}
      <div className="bg-slate-950 text-slate-50 font-mono text-[10px] rounded-xl p-3 border border-slate-800 overflow-x-auto shadow-inner select-all relative mb-3 leading-relaxed">
        {/* Terminal Header dots */}
        <div className="flex gap-1.5 mb-2.5 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <pre className="whitespace-pre-wrap"><code className="font-mono">{code}</code></pre>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800 rounded-xl leading-relaxed text-[10px] text-slate-600 dark:text-zinc-300 font-semibold select-none flex gap-2">
        <Eye className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed whitespace-pre-wrap">{explanation}</p>
      </div>
    </motion.div>
  );
}
export default ExampleSnippet;
