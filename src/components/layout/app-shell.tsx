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
    return (
      <div className="min-h-screen w-full bg-background transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-slate-100 dark:bg-[#070a13] transition-colors duration-300">
      {/* Centered responsive container that occupies 100% height without any vertical margins or collapsing */}
      <div className="w-full min-h-screen md:h-screen max-w-[420px] bg-background flex flex-col relative overflow-hidden border-x border-zinc-200 dark:border-zinc-900 shadow-xl transition-all">
        {children}
      </div>
    </div>
  );
}
