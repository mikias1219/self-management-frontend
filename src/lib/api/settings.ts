import { apiClient } from "./client";
import type { UserSettings } from "@/lib/types";

export const settingsApi = {
  get: () => apiClient.get<UserSettings>("/settings").then((r) => r.data),
  update: (data: Partial<UserSettings>) =>
    apiClient.patch<UserSettings>("/settings", data).then((r) => r.data),
};
