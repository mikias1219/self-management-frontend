import { apiClient } from "./client";
import type {
  AnalyticsCountsResponse,
  DateRangeQuery,
  FinanceIntelligence,
  TaskIntelligence,
  UnifiedIntelligence,
} from "@/lib/types";

export const analyticsApi = {
  getCounts: (params?: DateRangeQuery) =>
    apiClient
      .get<AnalyticsCountsResponse>("/analytics/counts", { params })
      .then((r) => r.data),

  getIntelligence: (params?: DateRangeQuery) =>
    apiClient
      .get<UnifiedIntelligence>("/analytics/intelligence", { params })
      .then((r) => r.data),

  getFinanceIntelligence: (params?: DateRangeQuery) =>
    apiClient
      .get<FinanceIntelligence>("/analytics/intelligence/finance", { params })
      .then((r) => r.data),

  getTaskIntelligence: () =>
    apiClient
      .get<TaskIntelligence>("/analytics/intelligence/tasks")
      .then((r) => r.data),
};
