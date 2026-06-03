import { apiClient } from "./client";
import type { ActivityLog, DateRangeQuery } from "@/lib/types";

export const activityLogsApi = {
  getAll: (params?: DateRangeQuery) =>
    apiClient
      .get<ActivityLog[]>("/activity-logs", { params })
      .then((r) => r.data),
  getByPeriod: (params: DateRangeQuery) =>
    apiClient
      .get<ActivityLog[]>("/activity-logs", { params })
      .then((r) => r.data),
};
