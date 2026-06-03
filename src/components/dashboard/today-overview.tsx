"use client";

import { CheckSquare, Flag, Repeat } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { dashboardApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function TodayOverview() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["dashboard"],
    () => dashboardApi.getOverview(),
    { enabled: authenticated },
  );

  const s = data?.summary;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      <StatCard
        title="Unread alerts"
        value={s?.unreadNotifications ?? "—"}
        loading={authenticated && isLoading}
      />
    </div>
  );
}
