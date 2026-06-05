import { apiClient } from "./client";
import type { PosDashboardOverview } from "@/lib/types";

export const dashboardApi = {
  getOverview: () =>
    apiClient.get<PosDashboardOverview>("/dashboard").then((r) => r.data),
};
