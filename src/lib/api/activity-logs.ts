import { apiClient } from "./client";
import type { ActivityLog, DateRangeQuery } from "@/lib/types";

type ActivityLogsResponse =
  | ActivityLog[]
  | { data: ActivityLog[]; meta?: { page: number; limit: number; total: number } };

function unwrapLogs(response: ActivityLogsResponse): ActivityLog[] {
  return Array.isArray(response) ? response : response.data;
}

export const activityLogsApi = {
  getAll: (params?: DateRangeQuery) =>
    apiClient
      .get<ActivityLogsResponse>("/activity-logs", { params: { ...params, limit: 20 } })
      .then((r) => unwrapLogs(r.data)),
  getByPeriod: (params: DateRangeQuery) =>
    apiClient
      .get<ActivityLogsResponse>("/activity-logs", { params: { ...params, limit: 20 } })
      .then((r) => unwrapLogs(r.data)),
};
