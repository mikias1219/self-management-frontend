import { ListChecks } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

const ProductivityTodayModule = loadPanel(
  () => import("@/app/(dashboard)/productivity/_today-module"),
  "ProductivityTodayModule",
);
const ProductivityProgressModule = loadPanel(
  () => import("@/app/(dashboard)/productivity/_progress-module"),
  "ProductivityProgressModule",
);
const TasksModule = loadPanel(
  () => import("@/app/(dashboard)/tasks/_module"),
  "TasksModule",
);
const GoalsModule = loadPanel(
  () => import("@/app/(dashboard)/goals/_module"),
  "GoalsModule",
);
const HabitsModule = loadPanel(
  () => import("@/app/(dashboard)/habits/_module"),
  "HabitsModule",
);
const DailyReviewsModule = loadPanel(
  () => import("@/app/(dashboard)/daily-reviews/_module"),
  "DailyReviewsModule",
);

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
