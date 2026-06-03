import type { BaseEntity } from "./common";

export type GoalLevel =
  | "vision"
  | "yearly"
  | "quarterly"
  | "monthly"
  | "weekly"
  | "daily";

export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  level: GoalLevel;
  parentId?: string;
  targetDate?: string;
  progress: number;
  category?: string;
}
