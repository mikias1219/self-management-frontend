"use client";

import { FloatingAiChat } from "@/components/ai-coach/floating-ai-chat";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">{children}</main>
      </div>
      <FloatingAiChat />
    </div>
  );
}
