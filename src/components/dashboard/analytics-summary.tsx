"use client";

import { MetricChart } from "@/components/shared/metric-chart";
import { hasAuthToken } from "@/lib/api/client";
import { colorForModuleKey } from "@/lib/constants/chart-colors";
import { useAnalyticsCounts } from "@/hooks/use-analytics-counts";

export function AnalyticsSummary() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useAnalyticsCounts();

  const c = data?.counts;
  const chartData = c
    ? [
        { name: "English", value: c.englishPractices, moduleKey: "englishPractices" },
        { name: "Spiritual", value: c.spiritualActivities, moduleKey: "spiritualActivities" },
        { name: "Health", value: c.healthLogs, moduleKey: "healthLogs" },
        { name: "Reviews", value: c.dailyReviews, moduleKey: "dailyReviews" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <MetricChart
      title="Wellness & growth"
      data={chartData}
      type="line"
      loading={authenticated && isLoading}
      height={180}
      color={colorForModuleKey("healthLogs")}
    />
  );
}
