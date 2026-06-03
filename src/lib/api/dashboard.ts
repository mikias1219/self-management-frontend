import { apiClient } from "./client";
import type { DashboardOverview } from "@/lib/types";

export const dashboardApi = {
  getOverview: () =>
    apiClient.get<DashboardOverview>("/dashboard").then((r) => r.data),
};
