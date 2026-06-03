import type { BaseEntity } from "./common";

export type SpiritualActivityType =
  | "prayer"
  | "bible_reading"
  | "meditation"
  | "reflection"
  | "church";

export interface SpiritualActivity extends BaseEntity {
  activityType: SpiritualActivityType;
  activityDate: string;
  durationMinutes?: number;
  notes?: string;
}
