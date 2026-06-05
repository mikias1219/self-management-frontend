import {
  GraduationCap,
  HeartHandshake,
  LineChart,
  ListChecks,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { HubTab, HubTabGroup } from "@/components/hubs/hub-layout";
import type { LucideIcon } from "lucide-react";

// Lazy-load every module panel (they are all named exports).
// This dramatically speeds up initial compilation of hubs.
const ProductivityTodayModule = dynamic(() =>
  import("@/app/(dashboard)/productivity/_today-module").then((m) => m.ProductivityTodayModule),
);
const ProductivityProgressModule = dynamic(() =>
  import("@/app/(dashboard)/productivity/_progress-module").then((m) => m.ProductivityProgressModule),
);
const TasksModule = dynamic(() =>
  import("@/app/(dashboard)/tasks/_module").then((m) => m.TasksModule),
);
const GoalsModule = dynamic(() =>
  import("@/app/(dashboard)/goals/_module").then((m) => m.GoalsModule),
);
const HabitsModule = dynamic(() =>
  import("@/app/(dashboard)/habits/_module").then((m) => m.HabitsModule),
);
const DailyReviewsModule = dynamic(() =>
  import("@/app/(dashboard)/daily-reviews/_module").then((m) => m.DailyReviewsModule),
);
const LearningModule = dynamic(() =>
  import("@/app/(dashboard)/learning/_module").then((m) => m.LearningModule),
);
const EnglishModule = dynamic(() =>
  import("@/app/(dashboard)/english/_module").then((m) => m.EnglishModule),
);
const FinanceModule = dynamic(() =>
  import("@/app/(dashboard)/finance/_module").then((m) => m.FinanceModule),
);
const HealthModule = dynamic(() =>
  import("@/app/(dashboard)/health/_module").then((m) => m.HealthModule),
);
const SpiritualModule = dynamic(() =>
  import("@/app/(dashboard)/spiritual/_module").then((m) => m.SpiritualModule),
);
const JournalModule = dynamic(() =>
  import("@/app/(dashboard)/journal/_module").then((m) => m.JournalModule),
);
const AnalyticsModule = dynamic(() =>
  import("@/app/(dashboard)/analytics/_module").then((m) => m.AnalyticsModule),
);
const ActivityLogsModule = dynamic(() =>
  import("@/app/(dashboard)/activity-logs/_module").then((m) => m.ActivityLogsModule),
);

export interface HubConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  tabs: HubTab[];
  tabGroups?: HubTabGroup[];
  defaultTab: string;
  panels: Record<string, React.ComponentType>;
}

export const PRODUCTIVITY_HUB: HubConfig = {
  title: "Productivity",
  subtitle:
    "Plan your day, track momentum, and manage tasks, goals, habits, and reviews in one place.",
  icon: ListChecks,
  iconClassName: "bg-sky-500/15 text-sky-600",
  tabGroups: [
    { label: "Focus", tabIds: ["today", "progress"] },
    { label: "Manage", tabIds: ["tasks", "goals", "habits", "review"] },
  ],
  tabs: [
    {
      id: "today",
      label: "Today",
      description:
        "Today's schedule — tasks, calendar events, and your daily score.",
    },
    {
      id: "progress",
      label: "Progress",
      description:
        "Success score and trends across day, week, month, and year.",
    },
    {
      id: "tasks",
      label: "Tasks",
      description: "All tasks — create, edit, due dates, and time tracking.",
    },
    {
      id: "goals",
      label: "Goals",
      description: "Daily through yearly goals with measurable progress.",
    },
    {
      id: "habits",
      label: "Habits",
      description: "Routines, streaks, and daily check-ins.",
    },
    {
      id: "review",
      label: "Review",
      description: "End-of-day reflection and mood.",
    },
  ],
  defaultTab: "today",
  panels: {
    today: ProductivityTodayModule,
    progress: ProductivityProgressModule,
    tasks: TasksModule,
    goals: GoalsModule,
    habits: HabitsModule,
    review: DailyReviewsModule,
  },
};

export const GROWTH_HUB: HubConfig = {
  title: "Growth",
  subtitle:
    "Skills and language in one place — track learning and English practice together.",
  icon: GraduationCap,
  iconClassName: "bg-emerald-500/15 text-emerald-600",
  tabs: [
    {
      id: "learning",
      label: "Learning",
      description: "Courses, skills, and study sessions.",
    },
    {
      id: "english",
      label: "English",
      description: "Vocabulary, practice, and language progress.",
    },
  ],
  defaultTab: "learning",
  panels: {
    learning: LearningModule,
    english: EnglishModule,
  },
};

export const LIFE_HUB: HubConfig = {
  title: "Life",
  subtitle:
    "Finance, health, spiritual practice, and journaling — the personal side of your stand.",
  icon: HeartHandshake,
  iconClassName: "bg-rose-500/15 text-rose-600",
  tabs: [
    {
      id: "finance",
      label: "Finance",
      description: "Accounts, budgets, transactions, and savings.",
    },
    {
      id: "health",
      label: "Health",
      description: "Workouts, metrics, and wellness tracking.",
    },
    {
      id: "spiritual",
      label: "Spiritual",
      description: "Prayer, scripture, and faith practices.",
    },
    {
      id: "journal",
      label: "Journal",
      description: "Daily entries and reflections.",
    },
  ],
  defaultTab: "finance",
  panels: {
    finance: FinanceModule,
    health: HealthModule,
    spiritual: SpiritualModule,
    journal: JournalModule,
  },
};

export const INSIGHTS_HUB: HubConfig = {
  title: "Insights",
  subtitle: "Analytics and activity history across your LifeOS data.",
  icon: LineChart,
  iconClassName: "bg-violet-500/15 text-violet-600",
  tabs: [
    {
      id: "analytics",
      label: "Analytics",
      description: "Charts and cross-module metrics.",
    },
    {
      id: "activity",
      label: "Activity log",
      description: "Audit trail of actions and completions.",
    },
  ],
  defaultTab: "analytics",
  panels: {
    analytics: AnalyticsModule,
    activity: ActivityLogsModule,
  },
};
