import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CheckSquare,
  DollarSign,
  FileText,
  Flag,
  Heart,
  Languages,
  LayoutDashboard,
  Repeat,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  group?: string;
  color: string;
}

export const NAV_GROUP_COLORS: Record<string, string> = {
  Overview: "text-violet-600",
  Productivity: "text-sky-600",
  Growth: "text-emerald-600",
  Life: "text-amber-700",
  Insights: "text-fuchsia-600",
  System: "text-slate-600",
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "Overview",
    color: "bg-violet-500/15 text-violet-600",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    group: "Productivity",
    color: "bg-sky-500/15 text-sky-600",
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Flag,
    group: "Productivity",
    color: "bg-cyan-500/15 text-cyan-600",
  },
  {
    title: "Habits",
    href: "/habits",
    icon: Repeat,
    group: "Productivity",
    color: "bg-blue-500/15 text-blue-600",
  },
  {
    title: "Daily Reviews",
    href: "/daily-reviews",
    icon: Sun,
    group: "Productivity",
    color: "bg-indigo-500/15 text-indigo-600",
  },
  {
    title: "Learning",
    href: "/learning",
    icon: BookOpen,
    group: "Growth",
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
    group: "Life",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    title: "English",
    href: "/english",
    icon: Languages,
    group: "Growth",
    color: "bg-teal-500/15 text-teal-600",
  },
  {
    title: "Spiritual",
    href: "/spiritual",
    icon: Sparkles,
    group: "Life",
    color: "bg-purple-500/15 text-purple-600",
  },
  {
    title: "Health",
    href: "/health",
    icon: Heart,
    group: "Life",
    color: "bg-rose-500/15 text-rose-600",
  },
  {
    title: "Journal",
    href: "/journal",
    icon: FileText,
    group: "Life",
    color: "bg-orange-500/15 text-orange-600",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    group: "Insights",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
  },
  {
    title: "Activity Logs",
    href: "/activity-logs",
    icon: Activity,
    group: "Insights",
    color: "bg-pink-500/15 text-pink-600",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    group: "System",
    color: "bg-slate-500/15 text-slate-600",
  },
  {
    title: "AI Coach",
    href: "/ai-coach",
    icon: Bot,
    group: "System",
    color: "bg-zinc-500/15 text-zinc-600",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    group: "System",
    color: "bg-neutral-500/15 text-neutral-600",
  },
];

export const NAV_GROUPS = [
  "Overview",
  "Productivity",
  "Growth",
  "Life",
  "Insights",
  "System",
] as const;
