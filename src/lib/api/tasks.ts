import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type { Task } from "@/lib/types";

export const tasksApi = {
  ...createCrudApi<Task>("/tasks"),

  report(id: string, data: { timeSpentMinutes: number; notes?: string }) {
    return apiClient
      .post<Task>(`/tasks/${id}/report`, data)
      .then((r) => r.data);
  },
};
