"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, LineChart, Trophy } from "lucide-react";
import { ModuleShell } from "@/components/shared/module-shell";
import { WeeklySnapshotCard } from "@/components/shared/weekly-snapshot-card";
import { AIInsightCard } from "@/components/shared/ai-insight-card";
import { AchievementsPanel } from "@/components/analytics/achievements-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type InsightsTab = "overview" | "activity" | "achievements";

function InsightsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: InsightsTab =
    rawTab === "activity" || rawTab === "achievements" ? rawTab : "overview";
  const authenticated = hasAuthToken();

  const setTab = (next: InsightsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/insights?${qs}` : "/insights", { scroll: false });
  };

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
    metrics && "tasksCompleted" in metrics ? metrics : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <ModuleShell
        title="Analytics"
        description="Weekly snapshot, trends, AI coach, and achievements"
        icon={LineChart}
        iconClassName="bg-fuchsia-500/15 text-fuchsia-600"
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as InsightsTab)}>
          <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {(
              [
                ["overview", "Overview"],
                ["activity", "Activity log"],
                ["achievements", "Achievements"],
              ] as const
            ).map(([id, label]) => (
              <TabsTrigger
                key={id}
                value={id}
                className="h-8 rounded-full px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {tab === "overview" && (
          <div className="space-y-6">
            <Link
              href="/ai-coach"
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600">
                <Bot className="size-5" />
              </div>
              <div>
                <p className="font-medium">AI Coach</p>
                <p className="text-sm text-muted-foreground">
                  Chat with your Personal OS assistant
                </p>
              </div>
            </Link>

            <WeeklySnapshotCard
              tasksCompleted={
                weekMetrics?.tasksCompleted ??
                intel?.tasks?.completedThisWeek ??
                0
              }
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
          </div>
        )}

        {tab === "activity" && <ActivityLogsModule compact />}
        {tab === "achievements" && <AchievementsPanel />}
      </ModuleShell>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-7xl rounded-xl" />}>
      <InsightsInner />
    </Suspense>
  );
}
