"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isWelcomePage = pathname === "/welcome";

  if (isWelcomePage) {
    return <div className="min-h-screen w-full bg-background transition-colors duration-300">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-slate-100 dark:bg-[#0b0f19] dot-grid-bg-light dark:dot-grid-bg transition-colors duration-300">
      {/* Smartphone Chassis Frame for Desktop Viewports */}
      <div className="w-full h-full md:max-w-[412px] md:h-[860px] md:rounded-[48px] md:border-[10px] md:border-zinc-800 dark:md:border-zinc-900 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] dark:md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-background flex flex-col relative md:overflow-hidden transition-all duration-300">
        
        {/* Dynamic Island / Notch at the top of the chassis (Desktop only) */}
        <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-800 dark:bg-zinc-900 rounded-full z-50 items-center justify-between px-3.5">
          {/* Camera Lens */}
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 dark:bg-zinc-800/80 border border-zinc-900" />
          {/* Sensor */}
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800/60 dark:bg-zinc-900/60" />
        </div>
        
        {/* Inner Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
