import type { BaseEntity } from "./common";

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit extends BaseEntity {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  category?: string;
  currentStreak: number;
  bestStreak: number;
  color?: string;
}

export interface HabitLog extends BaseEntity {
  habitId: string;
  completedAt: string;
  notes?: string;
}
