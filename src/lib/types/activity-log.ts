import type { BaseEntity } from "./common";

export type ActivityModule =
  | "auth"
  | "tasks"
  | "goals"
  | "habits"
  | "daily_reviews"
  | "learning"
  | "finance"
  | "english"
  | "spiritual"
  | "health"
  | "journal"
  | "notifications"
  | "settings"
  | "ai_coach";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "completed"
  | "logged";

export interface ActivityLog extends BaseEntity {
  userId: string;
  module: ActivityModule;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
