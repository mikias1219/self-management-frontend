import { apiClient } from "./client";
import type { DateRangeQuery } from "@/lib/types";

export interface TimelineEvent {
  id: string;
  type: "activity" | "task_completed" | "finance";
  title: string;
  description?: string;
  timestamp: string;
  module?: string;
  metadata?: Record<string, unknown>;
}

export const timelineApi = {
  getAll: (params?: DateRangeQuery) =>
    apiClient
      .get<TimelineEvent[]>("/timeline", { params })
      .then((r) => r.data),
};
