import { apiClient } from "./client";
import type { AnalyticsPeriod } from "@/lib/types";
import type {
  PeriodProductivityMetrics,
  ProductivityMetricsAll,
  ProductivitySchedule,
} from "@/lib/types/productivity";

export type {
  PeriodProductivityMetrics,
  PeriodTrendPoint,
  ProductivityMetricsAll,
  ProductivitySchedule,
  ScheduleItem,
  ScheduleItemKind,
  TodaySuccess,
} from "@/lib/types/productivity";

export const productivityApi = {
  getMetrics: (period?: AnalyticsPeriod) =>
    apiClient
      .get<PeriodProductivityMetrics | ProductivityMetricsAll>(
        "/productivity/metrics",
        { params: period ? { period } : undefined },
      )
      .then((r) => r.data),

  getSchedule: (opts?: { days?: number; scope?: "today" | "upcoming" }) =>
    apiClient
      .get<ProductivitySchedule>("/productivity/schedule", {
        params: {
          days: opts?.days,
          scope: opts?.scope ?? "today",
        },
      })
      .then((r) => r.data),
};
