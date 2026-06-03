import type { BaseEntity } from "./common";

export type LearningItemStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "paused";

export interface Skill extends BaseEntity {
  name: string;
  description?: string;
  proficiency: number;
}

export interface Book extends BaseEntity {
  title: string;
  author?: string;
  learningStatus: LearningItemStatus;
  pagesRead: number;
  totalPages?: number;
}

export interface Course extends BaseEntity {
  title: string;
  platform?: string;
  learningStatus: LearningItemStatus;
  progress: number;
  hoursSpent: number;
}

export interface LearningProject extends BaseEntity {
  name: string;
  description?: string;
  learningStatus: LearningItemStatus;
  progress: number;
}

export interface StudySession extends BaseEntity {
  sessionDate: string;
  durationMinutes: number;
  topic?: string;
  notes?: string;
  skillId?: string;
  courseId?: string;
}
