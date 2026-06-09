"use client";

import Link from "next/link";
import {
  Bell,
  Bot,
  LineChart,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import { ModuleShell } from "@/components/shared/module-shell";
import { cn } from "@/lib/utils";

const MORE_LINKS = [
  {
    title: "AI Coach",
    description: "Chat with your Personal OS assistant",
    href: "/ai-coach",
    icon: Bot,
    color: "bg-indigo-500/15 text-indigo-600",
  },
  {
    title: "Analytics",
    description: "Weekly snapshot, trends, and AI observations",
    href: "/insights",
    icon: LineChart,
    color: "bg-fuchsia-500/15 text-fuchsia-600",
  },
  {
    title: "Achievements",
    description: "Badges and milestones from your progress",
    href: "/insights?tab=achievements",
    icon: Trophy,
    color: "bg-amber-500/15 text-amber-600",
  },
  {
    title: "Profile",
    description: "Identity, focus areas, and life stats",
    href: "/profile",
    icon: UserRound,
    color: "bg-violet-500/15 text-violet-600",
  },
  {
    title: "Notifications",
    description: "Alerts and reminders",
    href: "/notifications",
    icon: Bell,
    color: "bg-slate-500/15 text-slate-600",
  },
  {
    title: "Settings",
    description: "Preferences, integrations, and account",
    href: "/settings",
    icon: Settings,
    color: "bg-neutral-500/15 text-neutral-600",
  },
] as const;

export default function MorePage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ModuleShell
        title="More"
        description="Power features, settings, and your profile"
        icon={Settings}
        iconClassName="bg-slate-500/15 text-slate-600"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {MORE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  item.color,
                )}
              >
                <item.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </ModuleShell>
    </div>
  );
}
