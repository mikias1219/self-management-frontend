import { ListChecks } from "lucide-react";
import { loadPanel } from "@/components/hubs/configs/panel-loader";
import type { HubConfig } from "@/components/hubs/configs/types";

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

export const PRODUCTIVITY_HUB: HubConfig = {
  title: "Productivity",
  subtitle: "Tasks, goals, and habits — plan and track what matters.",
  icon: ListChecks,
  iconClassName: "bg-sky-500/15 text-sky-600",
  tabs: [
    {
      id: "tasks",
      label: "Tasks",
      description: "All tasks — create, edit, due dates, and time tracking.",
      primary: true,
    },
    {
      id: "goals",
      label: "Goals",
      description: "Life goals, milestones, and weekly targets.",
    },
    {
      id: "habits",
      label: "Habits",
      description: "Routines, streaks, and daily check-ins.",
    },
  ],
  defaultTab: "tasks",
  panels: {
    tasks: TasksModule,
    goals: GoalsModule,
    habits: HabitsModule,
  },
};
