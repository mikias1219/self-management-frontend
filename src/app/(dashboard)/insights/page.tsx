"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LineChart } from "lucide-react";
import { ModuleShell } from "@/components/shared/module-shell";
import { WeeklySnapshotCard } from "@/components/shared/weekly-snapshot-card";
import { AIInsightCard } from "@/components/shared/ai-insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useStandData } from "@/hooks/use-stand-data";
import { analyticsApi } from "@/lib/api/analytics";
import { productivityApi } from "@/lib/api/productivity";
import { hasAuthToken } from "@/lib/api/client";

const MetricChart = dynamic(
  () =>
    import("@/components/shared/metric-chart").then((m) => ({
      default: m.MetricChart,
    })),
  { loading: () => <Skeleton className="h-[220px] w-full rounded-xl" /> },
);

const ActivityLogsModule = dynamic(
  () =>
    import("@/app/(dashboard)/activity-logs/_module").then((m) => ({
      default: m.ActivityLogsModule,
    })),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

export default function InsightsPage() {
  const authenticated = hasAuthToken();
  const [showActivity, setShowActivity] = useState(false);

  const { data: intel } = useStandData(
    ["analytics", "intelligence"],
    () => analyticsApi.getIntelligence(),
    { enabled: authenticated },
  );
  const { data: metrics } = useStandData(
    ["productivity", "metrics", "week"],
    () => productivityApi.getMetrics("week"),
    { enabled: authenticated },
  );

  const weekMetrics =
    metrics && "tasksCompleted" in metrics
      ? metrics
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <ModuleShell
        title="Analytics"
        description="Weekly snapshot, trends, and AI observations"
        icon={LineChart}
        iconClassName="bg-fuchsia-500/15 text-fuchsia-600"
      >
        <div className="space-y-6">
          <WeeklySnapshotCard
            tasksCompleted={weekMetrics?.tasksCompleted ?? intel?.tasks?.completedThisWeek ?? 0}
            habitsStreak={intel?.habits?.bestStreak ?? 0}
            moneyVsBudget={
              intel?.finance?.monthly?.savingsRate != null
                ? `${intel.finance.monthly.savingsRate}% saved`
                : "—"
            }
            studyMinutes={intel?.learning?.studyMinutesThisWeek ?? 0}
          />

          <AIInsightCard moduleKey="insights" />

          <div className="grid gap-4 lg:grid-cols-3">
            <MetricChart
              title="Mood (30 days)"
              data={intel?.moodTrend ?? []}
              type="line"
              height={200}
            />
            <MetricChart
              title="Task completion (4 weeks)"
              data={intel?.tasks?.weeklyCompletionTrend ?? []}
              type="bar"
              height={200}
            />
            <MetricChart
              title="Spend vs income (3 months)"
              data={intel?.finance?.monthlyTrend ?? []}
              type="bar"
              height={200}
              multiColor
            />
          </div>

          <div className="rounded-xl border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-medium">Activity log</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActivity((v) => !v)}
              >
                {showActivity ? "Hide" : "See all activity"}
              </Button>
            </div>
            {showActivity && (
              <div className="p-4">
                <ActivityLogsModule />
              </div>
            )}
          </div>
        </div>
      </ModuleShell>
    </div>
  );
}
