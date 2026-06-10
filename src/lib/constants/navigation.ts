import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bot,
  DollarSign,
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
  Main: "text-violet-600",
  System: "text-slate-600",
};

/** Sidebar: 5 top-level items per redesign spec. */
export const NAV_ITEMS: NavItem[] = [
  {
    title: "Today",
    href: "/",
    icon: LayoutDashboard,
    group: "Main",
    color: "bg-violet-500/15 text-violet-600",
    description: "Daily command centre — tasks, habits, bills, KPIs",
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
    title: "Life",
    href: "/life",
    icon: HeartHandshake,
    group: "Main",
    color: "bg-rose-500/15 text-rose-600",
    description: "Health, learning, journal, and spiritual practice",
  },
  {
    title: "Analytics",
    href: "/insights",
    icon: LineChart,
    group: "Main",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
    description: "Weekly snapshot, trends, AI coach, and achievements",
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
    color: "bg-sky-500/15 text-sky-600",
  },
  {
    title: "Goals",
    href: "/productivity?tab=goals",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-sky-500/15 text-sky-600",
  },
  {
    title: "Habits",
    href: "/productivity?tab=habits",
    icon: ListChecks,
    group: "Productivity",
    color: "bg-sky-500/15 text-sky-600",
  },
  {
    title: "Learning",
    href: "/life?tab=learning",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-emerald-500/15 text-emerald-600",
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
    title: "Spiritual",
    href: "/life?tab=spiritual",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-violet-500/15 text-violet-600",
  },
  {
    title: "English",
    href: "/life?tab=english",
    icon: HeartHandshake,
    group: "Life",
    color: "bg-blue-500/15 text-blue-600",
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
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    title: "Savings goals",
    href: "/finance?tab=goals",
    icon: DollarSign,
    group: "Finance",
    color: "bg-amber-500/15 text-amber-700",
  },
  {
    title: "AI Coach",
    href: "/ai-coach",
    icon: Bot,
    group: "Analytics",
    color: "bg-indigo-500/15 text-indigo-600",
  },
  {
    title: "Activity log",
    href: "/insights?tab=activity",
    icon: LineChart,
    group: "Analytics",
    color: "bg-fuchsia-500/15 text-fuchsia-600",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
    group: "System",
    color: "bg-slate-500/15 text-slate-600",
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
