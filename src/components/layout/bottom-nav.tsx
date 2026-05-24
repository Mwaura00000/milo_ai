"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Timer, Bot, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Hide the navigation entirely on welcome and onboarding pages
  if (pathname === "/welcome" || pathname === "/onboarding") return null;

  const navItems = [
    { href: "/", label: "Today", icon: Calendar },
    { href: "/focus", label: "Focus", icon: Timer },
    { href: "/buddy", label: "Buddy", icon: Bot },
    { href: "/insights", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50">
      <nav className="bg-[#18181b]/95 dark:bg-[#121214]/95 border border-zinc-200/20 dark:border-zinc-800/80 rounded-[28px] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.8)] backdrop-blur-md px-2 py-2">
        <div className="flex h-12 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center relative w-16 h-full text-zinc-400 dark:text-zinc-500 transition-all duration-300 hover:scale-105 active:scale-95 group"
                )}
              >
                <div className={cn(
                  "flex flex-col items-center gap-0.5",
                  isActive && "text-[#14fac8]"
                )}>
                  {/* Icon with interactive spring scaling and glow */}
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5",
                    isActive ? "stroke-[#14fac8] fill-[#14fac8]/10 animate-pulse-glow" : "stroke-current"
                  )} strokeWidth={isActive ? 2.5 : 2} />
                  
                  <span className={cn(
                    "text-[9px] font-bold tracking-wide transition-colors",
                    isActive ? "text-[#14fac8]" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-200"
                  )}>
                    {item.label}
                  </span>
                </div>

                {/* Micro Active Dot Indicator below navigation */}
                {isActive && (
                  <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#14fac8] shadow-[0_0_8px_#14fac8] animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
