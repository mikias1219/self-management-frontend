import { apiClient } from "./client";
import type { AchievementsSnapshot, DateRangeQuery } from "@/lib/types";

export const achievementsApi = {
  getSnapshot: (params?: DateRangeQuery) =>
    apiClient
      .get<AchievementsSnapshot>("/achievements", { params })
      .then((r) => r.data),
};
