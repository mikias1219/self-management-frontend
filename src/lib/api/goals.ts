import { createCrudApi } from "./crud";
import type { Goal } from "@/lib/types";

import { apiClient } from "./client";

export const goalsApi = {
  ...createCrudApi<Goal>("/goals"),
  updateProgress: (id: string, progress: number) =>
    apiClient.post<Goal>(`/goals/${id}/update-progress`, { progress }).then((r) => r.data),
  getProgressSummary: () =>
    apiClient.get("/goals/progress-summary").then((r) => r.data),
};
