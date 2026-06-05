import type { BaseEntity } from "./common";
import type { LifeArea } from "./life-area";

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
  lifeArea?: LifeArea;
  measurableTarget?: number;
  syncToCalendar?: boolean;
  googleCalendarEventId?: string;
}
