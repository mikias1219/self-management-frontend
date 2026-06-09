import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Settings,
  SlidersHorizontal,
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
  Main: "text-violet-600",
  System: "text-slate-600",
};

/** Sidebar: 5 top-level items per redesign spec. */
export const NAV_ITEMS: NavItem[] = [
  {
    title: "Today",
    href: "/today",
    icon: LayoutDashboard,
    group: "Main",
    color: "bg-violet-500/15 text-violet-600",
    description: "Daily command centre — tasks, habits, bills, spending",
  },
  {
    title: "Productivity",
    href: "/productivity",
    icon: ListChecks,
    group: "Main",
    color: "bg-sky-500/15 text-sky-600",
    description: "Tasks, goals, and habits",
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
    group: "Main",
    color: "bg-amber-500/15 text-amber-700",
    description: "Budget, transactions, and savings goals",
  },
  {
    title: "Growth",
    href: "/growth",
    icon: GraduationCap,
    group: "Main",
    color: "bg-emerald-500/15 text-emerald-600",
    description: "Learning, health, and wellbeing",
  },
  {
    title: "More",
    href: "/more",
    icon: SlidersHorizontal,
    group: "Main",
    color: "bg-slate-500/15 text-slate-600",
    description: "AI Coach, analytics, settings, and profile",
  },
];

/** @deprecated Sidebar is flat — kept for legacy references. */
export const NAV_GROUPS = ["Main"] as const;

/** Deep links for header search (hub + tab). */
export const NAV_SEARCH_EXTRAS: NavItem[] = [
  {
    title: "Tasks",
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
    title: "Learning",
    href: "/growth?tab=learning",
    icon: GraduationCap,
    group: "Growth",
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    title: "Health",
    href: "/growth?tab=health",
    icon: GraduationCap,
    group: "Growth",
    color: "bg-rose-500/15 text-rose-600",
  },
  {
    title: "Wellbeing",
    href: "/growth?tab=wellbeing",
    icon: GraduationCap,
    group: "Growth",
    color: "bg-orange-500/15 text-orange-600",
  },
  {
    title: "Budget",
    href: "/finance?tab=budget",
    icon: DollarSign,
    group: "Finance",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    title: "Transactions",
    href: "/finance?tab=transactions",
    icon: DollarSign,
    group: "Finance",
    color: "bg-yellow-500/15 text-yellow-700",
  },
  {
    title: "Savings goals",
    href: "/finance?tab=goals",
    icon: DollarSign,
    group: "Finance",
    color: "bg-lime-500/15 text-lime-700",
  },
  {
    title: "AI Coach",
    href: "/ai-coach",
    icon: Bot,
    group: "More",
    color: "bg-indigo-500/15 text-indigo-600",
  },
  {
    title: "Analytics",
    href: "/insights",
    icon: LineChart,
    group: "More",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
  },
  {
    title: "Activity log",
    href: "/insights?tab=activity",
    icon: LineChart,
    group: "More",
    color: "bg-pink-500/15 text-pink-600",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
    group: "More",
    color: "bg-indigo-500/15 text-indigo-600",
    description: "Your identity, focus areas, and life stats",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    group: "More",
    color: "bg-slate-500/15 text-slate-600",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    group: "More",
    color: "bg-neutral-500/15 text-neutral-600",
  },
];

export const ALL_SEARCH_NAV = [
  ...NAV_ITEMS,
  ...NAV_SEARCH_EXTRAS.filter(
    (extra) => !NAV_ITEMS.some((item) => item.href === extra.href),
  ),
];
