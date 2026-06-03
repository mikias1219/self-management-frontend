import { apiClient } from "./client";
import type { AnalyticsCountsResponse, DateRangeQuery } from "@/lib/types";

export const analyticsApi = {
  getCounts: (params?: DateRangeQuery) =>
    apiClient
      .get<AnalyticsCountsResponse>("/analytics/counts", { params })
      .then((r) => r.data),
};
