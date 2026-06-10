import { apiClient } from "./client";
import type { ActivityLog, DateRangeQuery, PaginatedResponse } from "@/lib/types";

export const activityLogsApi = {
  getPage: (params?: DateRangeQuery) =>
    apiClient
      .get<PaginatedResponse<ActivityLog>>("/activity-logs", {
        params: { page: 1, limit: 20, ...params },
      })
      .then((r) => r.data),

  /** @deprecated Use getPage — returns first page data only for hints. */
  getByPeriod: (params: DateRangeQuery) =>
    activityLogsApi.getPage({ ...params, limit: params.limit ?? 20 }).then(
      (r) => r.data,
    ),
};
