import type { Metadata, Viewport } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Milo | Adaptive Study Coach",
  description: "Your AI-powered cognitive study partner. Build smarter study habits with spaced repetition, active recall, and a personalized learning plan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Milo",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-touch-icon": "/milo_mascot.png",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className={`${nunito.variable} ${plusJakartaSans.variable} min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#090d16] text-foreground font-sans antialiased`}>
        <ServiceWorkerRegistrar />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>
            <main className="flex-1 overflow-hidden relative flex flex-col">
              {children}
            </main>
            <BottomNav />
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}




