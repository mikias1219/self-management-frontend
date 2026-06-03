"use client";

import { MetricChart } from "@/components/shared/metric-chart";
import { habitsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function HabitConsistency() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["habits"],
    () => habitsApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];

  const chartData = list.slice(0, 6).map((h) => ({
    name: h.name.slice(0, 12),
    value: h.currentStreak,
    moduleKey: "habitLogs",
  }));

  return (
    <MetricChart
      title="Habit streaks"
      data={chartData.length ? chartData : [{ name: "—", value: 0 }]}
      type="bar"
      loading={authenticated && isLoading}
      height={180}
      multiColor
      color="#3b82f6"
    />
  );
}
