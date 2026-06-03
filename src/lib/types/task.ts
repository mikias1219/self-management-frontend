import type { BaseEntity } from "./common";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  priority: TaskPriority;
  taskStatus: TaskStatus;
  category?: string;
  dueDate?: string;
  scheduledAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  timeSpentMinutes: number;
  goalId?: string;
}
