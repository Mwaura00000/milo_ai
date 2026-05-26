"use client";

import { motion } from "framer-motion";
import { Lightbulb, Info } from "lucide-react";

interface AnalogyCardProps {
  concept: string;
  analogy: string;
}

export function AnalogyCard({ concept, analogy }: AnalogyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="bg-amber-50 dark:bg-amber-950/20 border-2 border-b-6 border-zinc-950 rounded-2xl p-4 shadow-md max-w-sm w-full relative overflow-hidden group select-none"
    >
      <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-amber-500 border border-zinc-950 flex items-center justify-center text-zinc-950 animate-float shrink-0 shadow-sm">
          <Lightbulb className="w-4 h-4 fill-current stroke-[2.5]" />
        </div>
        <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400">
          Socratic Concept Hook
        </span>
      </div>

      <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-snug mb-2 font-sans">
        {concept}
      </h4>

      <p className="text-[11px] leading-relaxed font-bold text-zinc-600 dark:text-zinc-400 italic">
        &ldquo;{analogy}&rdquo;
      </p>

      <div className="mt-3.5 pt-2.5 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800/80 flex items-center gap-1.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest select-none">
        <Info className="w-3.5 h-3.5" />
        Analogy explanation mode active
      </div>
    </motion.div>
  );
}
export default AnalogyCard;
