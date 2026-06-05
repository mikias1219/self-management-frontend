import { createCrudApi } from "./crud";
import { apiClient } from "./client";
import type { DailyReview } from "@/lib/types";

export const dailyReviewsApi = {
  ...createCrudApi<DailyReview>("/daily-reviews"),
  getToday: () =>
    apiClient.get<DailyReview | null>("/daily-reviews/today").then((r) => r.data),
  upsertToday: (data: Partial<DailyReview>) =>
    apiClient.post<DailyReview>("/daily-reviews/today", data).then((r) => r.data),
};
