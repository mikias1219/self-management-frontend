import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Settings,
  UserRound,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  group?: string;
  color: string;
  description?: string;
  /** Permanent subtle accent in sidebar (e.g. AI Coach). */
  highlight?: boolean;
}

export const NAV_GROUP_COLORS: Record<string, string> = {
  Overview: "text-violet-600",
  "Life areas": "text-sky-600",
  System: "text-slate-600",
};

/** Sidebar: one entry per life area; related modules live in hub tabs. */
export const NAV_ITEMS: NavItem[] = [
  {
    title: "Today",
    href: "/today",
    icon: LayoutDashboard,
    group: "Overview",
    color: "bg-violet-500/15 text-violet-600",
    description: "Unified view — tasks, habits, bills, spending",
  },
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "Overview",
    color: "bg-violet-500/15 text-violet-600",
    description: "Personal OS — focus, finance, tasks, AI insight",
  },
  {
    title: "AI Coach",
    href: "/ai-coach",
    icon: Bot,
    group: "Overview",
    color: "bg-indigo-500/15 text-indigo-600",
    description: "Chat with your Personal OS assistant",
    highlight: true,
  },
  {
    title: "Productivity",
    href: "/productivity",
    icon: ListChecks,
    group: "Life areas",
    color: "bg-sky-500/15 text-sky-600",
    description: "Today, progress, tasks, goals, habits, and daily review",
  },
  {
    title: "Growth",
    href: "/growth",
    icon: GraduationCap,
    group: "Life areas",
    color: "bg-emerald-500/15 text-emerald-600",
    description: "Learning and English",
  },
  {
    title: "Life",
    href: "/life",
    icon: HeartHandshake,
    group: "Life areas",
    color: "bg-amber-500/15 text-amber-700",
    description: "Finance, spiritual, health, journal",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: LineChart,
    group: "Life areas",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
    description: "Analytics and activity log",
  },
];

/** @deprecated Sidebar is flat — kept for legacy references. */
export const NAV_GROUPS = ["Overview", "Life areas"] as const;

/** Deep links for header search (hub + tab). */
export const NAV_SEARCH_EXTRAS: NavItem[] = [
  {
    title: "Today",
    href: "/today",
    icon: ListChecks,
    group: "Overview",
    color: "bg-violet-500/15 text-violet-600",
  },
  {
    title: "Today (Productivity)",
    href: "/productivity?tab=today",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-violet-500/15 text-violet-600",
  },
  {
    title: "Progress",
    href: "/productivity?tab=progress",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-sky-500/15 text-sky-600",
  },
  {
    title: "All tasks",
    href: "/productivity?tab=tasks",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-cyan-500/15 text-cyan-600",
  },
  {
    title: "Goals",
    href: "/productivity?tab=goals",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-blue-500/15 text-blue-600",
  },
  {
    title: "Habits",
    href: "/productivity?tab=habits",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-indigo-500/15 text-indigo-600",
  },
  {
    title: "Daily review",
    href: "/productivity?tab=review",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-purple-500/15 text-purple-600",
  },
  {
    title: "Learning",
    href: "/growth?tab=learning",
    icon: GraduationCap,
    group: "Growth",
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    title: "English",
    href: "/growth?tab=english",
    icon: GraduationCap,
    group: "Growth",
    color: "bg-teal-500/15 text-teal-600",
  },
  {
    title: "Finance",
    href: "/life?tab=finance",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    title: "Spiritual",
    href: "/life?tab=spiritual",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-purple-500/15 text-purple-600",
  },
  {
    title: "Health",
    href: "/life?tab=health",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-rose-500/15 text-rose-600",
  },
  {
    title: "Journal",
    href: "/life?tab=journal",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-orange-500/15 text-orange-600",
  },
  {
    title: "Analytics",
    href: "/insights?tab=analytics",
    icon: LineChart,
    group: "Insights",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
  },
  {
    title: "Activity log",
    href: "/insights?tab=activity",
    icon: LineChart,
    group: "Insights",
    color: "bg-pink-500/15 text-pink-600",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
    group: "System",
    color: "bg-indigo-500/15 text-indigo-600",
    description: "Your identity, focus areas, and life stats",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    group: "System",
    color: "bg-slate-500/15 text-slate-600",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    group: "System",
    color: "bg-neutral-500/15 text-neutral-600",
  },
];

export const ALL_SEARCH_NAV = [
  ...NAV_ITEMS,
  ...NAV_SEARCH_EXTRAS.filter(
    (extra) => !NAV_ITEMS.some((item) => item.href === extra.href),
  ),
];
