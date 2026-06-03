import {
  GraduationCap,
  HeartHandshake,
  LineChart,
  ListChecks,
} from "lucide-react";
import { DailyReviewsModule } from "@/app/(dashboard)/daily-reviews/_module";
import { GoalsModule } from "@/app/(dashboard)/goals/_module";
import { HabitsModule } from "@/app/(dashboard)/habits/_module";
import { TasksModule } from "@/app/(dashboard)/tasks/_module";
import { EnglishModule } from "@/app/(dashboard)/english/_module";
import { LearningModule } from "@/app/(dashboard)/learning/_module";
import { FinanceModule } from "@/app/(dashboard)/finance/_module";
import { HealthModule } from "@/app/(dashboard)/health/_module";
import { JournalModule } from "@/app/(dashboard)/journal/_module";
import { SpiritualModule } from "@/app/(dashboard)/spiritual/_module";
import { AnalyticsModule } from "@/app/(dashboard)/analytics/_module";
import { ActivityLogsModule } from "@/app/(dashboard)/activity-logs/_module";
import type { HubTab } from "@/components/hubs/hub-layout";
import type { LucideIcon } from "lucide-react";

export interface HubConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName: string;
  tabs: HubTab[];
  defaultTab: string;
  panels: Record<string, React.ComponentType>;
}

export const PRODUCTIVITY_HUB: HubConfig = {
  title: "Productivity",
  subtitle:
    "Goals set direction, habits build rhythm, tasks and plans are what you do today, and daily reviews close the loop.",
  icon: ListChecks,
  iconClassName: "bg-sky-500/15 text-sky-600",
  tabs: [
    {
      id: "plans",
      label: "Plans & tasks",
      description:
        "Daily plans with time estimates — report how long you actually spent when done.",
    },
    {
      id: "goals",
      label: "Goals",
      description:
        "Vision → yearly → quarterly → monthly → weekly → daily. Progress rolls up from tasks.",
    },
    {
      id: "habits",
      label: "Habits",
      description:
        "Recurring behaviors you track; different from one-off tasks or goals.",
    },
    {
      id: "reviews",
      label: "Daily review",
      description: "End-of-day reflection: wins, lessons, and tomorrow’s focus.",
    },
  ],
  defaultTab: "plans",
  panels: {
    plans: TasksModule,
    goals: GoalsModule,
    habits: HabitsModule,
    reviews: DailyReviewsModule,
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
    "Money, body, spirit, and reflection — the areas that balance your day-to-day living.",
  icon: HeartHandshake,
  iconClassName: "bg-amber-500/15 text-amber-700",
  tabs: [
    {
      id: "finance",
      label: "Finance",
      description: "Income, expenses, budgets, and net worth.",
    },
    {
      id: "spiritual",
      label: "Spiritual",
      description: "Prayer, scripture, and spiritual practices.",
    },
    {
      id: "health",
      label: "Health",
      description: "Workouts, sleep, nutrition, and vitals.",
    },
    {
      id: "journal",
      label: "Journal",
      description: "Free-form notes and life events.",
    },
  ],
  defaultTab: "finance",
  panels: {
    finance: FinanceModule,
    spiritual: SpiritualModule,
    health: HealthModule,
    journal: JournalModule,
  },
};

export const INSIGHTS_HUB: HubConfig = {
  title: "Insights",
  subtitle: "See patterns in analytics and drill into every logged action.",
  icon: LineChart,
  iconClassName: "bg-fuchsia-500/15 text-fuchsia-600",
  tabs: [
    {
      id: "analytics",
      label: "Analytics",
      description: "Trends and charts across your data.",
    },
    {
      id: "activity",
      label: "Activity log",
      description: "Timeline of what you completed and logged.",
    },
  ],
  defaultTab: "analytics",
  panels: {
    analytics: AnalyticsModule,
    activity: ActivityLogsModule,
  },
};
