import type { BaseEntity } from "./common";

export interface UserSettings extends BaseEntity {
  timezone: string;
  locale: string;
  theme: string;
  dashboardLayout?: Record<string, unknown>;
  notificationPreferences?: Record<string, boolean>;
  modulePreferences?: Record<string, unknown>;
}
