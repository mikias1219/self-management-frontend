import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type { Task, TaskQuery } from "@/lib/types";

export const tasksApi = {
  ...createCrudApi<Task>("/tasks"),

  getAll: (params?: TaskQuery) =>
    apiClient.get<Task[]>("/tasks", { params }).then((r) => r.data),

  report(
    id: string,
    data: { timeSpentMinutes: number; notes?: string; completionNote?: string },
  ) {
    return apiClient
      .post<Task>(`/tasks/${id}/report`, data)
      .then((r) => r.data);
  },

  startTimer(id: string) {
    return apiClient.post<Task>(`/tasks/${id}/start-timer`).then((r) => r.data);
  },
};
