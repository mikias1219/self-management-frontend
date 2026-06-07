import type { BaseEntity } from "./common";
import type { LifeArea } from "./life-area";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";

export type RecurringInterval = "none" | "weekly" | "monthly" | "yearly";

export interface TaskQuery {
  taskStatus?: TaskStatus;
  lifeArea?: LifeArea;
  completedFrom?: string;
  completedTo?: string;
  dueFrom?: string;
  dueTo?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  parentTaskId?: string;
  topLevelOnly?: boolean;
  recurringOnly?: boolean;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  priority: TaskPriority;
  taskStatus: TaskStatus;
  lifeArea?: LifeArea;
  category?: string;
  startDate?: string;
  dueDate?: string;
  scheduledAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  timeSpentMinutes: number;
  goalId?: string;
  habitId?: string;
  syncToCalendar?: boolean;
  googleCalendarEventId?: string;
  completionNote?: string;
  parentTaskId?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  recurringParentId?: string;
  timerStartedAt?: string;
}
