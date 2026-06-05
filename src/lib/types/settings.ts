import type { BaseEntity } from "./common";

export interface UserSettings extends BaseEntity {
  timezone: string;
  locale: string;
  theme: string;
  /** Day of month salary arrives; finance cycles anchor to this (1–31). */
  salaryDay?: number;
  dashboardLayout?: Record<string, unknown>;
  notificationPreferences?: Record<string, boolean>;
  modulePreferences?: Record<string, unknown>;
}
