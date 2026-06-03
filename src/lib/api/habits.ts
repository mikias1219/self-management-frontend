import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type { Habit, HabitLog } from "@/lib/types";

export const habitsApi = {
  ...createCrudApi<Habit>("/habits"),
  getLogs: (habitId: string) =>
    apiClient
      .get<HabitLog[]>(`/habits/${habitId}/logs`)
      .then((r) => r.data),
  createLog: (habitId: string, data: Partial<HabitLog>) =>
    apiClient
      .post<HabitLog>(`/habits/${habitId}/logs`, data)
      .then((r) => r.data),
};
