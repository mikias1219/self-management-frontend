"use client";

import { CheckSquare, Flag, Repeat, Trophy } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { achievementsApi, dashboardApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

export function TodayOverview() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod();

  const { data: dash, isLoading: dashLoading } = useStandData(
    ["dashboard"],
    () => dashboardApi.getOverview(),
    { enabled: authenticated },
  );

  const { data: achievements, isLoading: achLoading } = useStandData(
    ["achievements", query],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  const s = dash?.summary;
  const o = achievements?.overall;
  const isLoading = dashLoading || achLoading;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatCard
        title="Period finished"
        value={o?.finished ?? "—"}
        description="Items completed in range"
        icon={Trophy}
        loading={authenticated && isLoading}
      />
      <StatCard
        title="Pending tasks"
        value={s?.pendingTasks ?? "—"}
        icon={CheckSquare}
        loading={authenticated && isLoading}
      />
      <StatCard
        title="Active goals"
        value={s?.activeGoals ?? "—"}
        icon={Flag}
        loading={authenticated && isLoading}
      />
      <StatCard
        title="Active habits"
        value={s?.activeHabits ?? "—"}
        icon={Repeat}
        loading={authenticated && isLoading}
      />
    </div>
  );
}
