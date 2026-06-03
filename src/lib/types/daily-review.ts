import type { BaseEntity } from "./common";

export interface DailyReview extends BaseEntity {
  reviewDate: string;
  wins?: string;
  challenges?: string;
  lessons?: string;
  tomorrowFocus?: string;
  moodScore?: number;
  productivityScore?: number;
}
