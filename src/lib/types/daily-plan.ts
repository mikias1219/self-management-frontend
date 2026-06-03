export type PlanStatus = "planned" | "in_progress" | "achieved" | "missed";

export type PlanModule =
  | "tasks"
  | "goals"
  | "habits"
  | "learning"
  | "spiritual"
  | "english"
  | "health"
  | "journal"
  | "finance"
  | "daily_reviews"
  | "other";

export interface DailyPlan {
  id: string;
  title: string;
  module: PlanModule;
  planDate: string;
  plannedMinutes: number;
  achievedMinutes: number;
  planStatus: PlanStatus;
  reportedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
