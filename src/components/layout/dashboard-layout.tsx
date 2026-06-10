"use client";

import dynamic from "next/dynamic";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const FloatingAiChat = dynamic(
  () =>
    import("@/components/ai-coach/floating-ai-chat").then((m) => ({
      default: m.FloatingAiChat,
    })),
  { ssr: false },
);

const PomodoroTimer = dynamic(
  () =>
    import("@/components/productivity/pomodoro-timer").then((m) => ({
      default: m.PomodoroTimer,
    })),
  { ssr: false },
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-6"
        >
          {children}
        </main>
      </div>
      <FloatingAiChat />
      <PomodoroTimer />
      <MobileBottomNav />
    </div>
  );
}
