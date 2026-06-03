import type { BaseEntity } from "./common";

export type EnglishPracticeType =
  | "speaking"
  | "listening"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar";

export interface EnglishPractice extends BaseEntity {
  practiceType: EnglishPracticeType;
  practiceDate: string;
  durationMinutes: number;
  notes?: string;
  score?: number;
}
