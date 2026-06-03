import type { ModuleCounts } from "./common";
import type { Task } from "./task";

export interface DashboardSummary {
  pendingTasks: number;
  activeGoals: number;
  activeHabits: number;
  unreadNotifications: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  todayActivity: ModuleCounts;
  recentTasks: Task[];
}
