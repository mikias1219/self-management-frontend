"use client";

import { MetricChart } from "@/components/shared/metric-chart";
import { hasAuthToken } from "@/lib/api/client";
import { colorForModuleKey } from "@/lib/constants/chart-colors";
import { useAnalyticsCounts } from "@/hooks/use-analytics-counts";

export function WeeklyOverview() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useAnalyticsCounts();

  const counts = data?.counts;
  const chartData = counts
    ? [
        { name: "Tasks", value: counts.tasks, moduleKey: "tasks" },
        { name: "Goals", value: counts.goals, moduleKey: "goals" },
        { name: "Habits", value: counts.habitLogs, moduleKey: "habitLogs" },
        { name: "Learning", value: counts.studySessions, moduleKey: "studySessions" },
        { name: "Finance", value: counts.transactions, moduleKey: "transactions" },
        { name: "Journal", value: counts.journalEntries, moduleKey: "journalEntries" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <MetricChart
      title="Activity by module"
      data={chartData}
      type="bar"
      loading={authenticated && isLoading}
      height={220}
      multiColor
      color={colorForModuleKey("tasks")}
    />
  );
}
