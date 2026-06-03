"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { financeApi, habitsApi, tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useAnalyticsCounts } from "@/hooks/use-analytics-counts";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

/** Weighted life score from real module metrics (0–100). */
export function LifeScore() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod();
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsCounts();

  const { data: finance } = useStandData(
    ["finance", "summary", query],
    () => financeApi.getSummary(query),
    { enabled: authenticated },
  );
  const { data: habits } = useStandData(
    ["habits"],
    () => habitsApi.getAll(),
    { enabled: authenticated },
  );
  const { data: tasks } = useStandData(
    ["tasks"],
    () => tasksApi.getAll(),
    { enabled: authenticated },
  );

  const isLoading = analyticsLoading;

  let score = 0;
  if (authenticated && analytics?.counts) {
    const c = analytics.counts;
    const habitList = habits ?? [];
    const taskList = tasks ?? [];
    const habitScore =
      habitList.length > 0
        ? Math.min(
            100,
            (habitList.reduce((s, h) => s + h.currentStreak, 0) /
              habitList.length) *
              10,
          )
        : 0;
    const taskDone = taskList.filter((t) => t.taskStatus === "done").length;
    const taskScore =
      taskList.length > 0 ? (taskDone / taskList.length) * 100 : 0;
    const activityScore = Math.min(
      100,
      (c.habitLogs * 8 +
        c.dailyReviews * 10 +
        c.studySessions * 6 +
        c.tasks * 4 +
        c.healthLogs * 5) /
        2,
    );
    const savingsScore = Math.min(100, Math.max(0, finance?.totals.savingsRate ?? 0) * 2);

    score = Math.round(
      habitScore * 0.25 +
        taskScore * 0.2 +
        activityScore * 0.25 +
        savingsScore * 0.15 +
        Math.min(100, c.dailyReviews * 15) * 0.15,
    );
    score = Math.min(100, Math.max(0, score));
  }

  const totalActivities = analytics?.counts
    ? Object.values(analytics.counts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-sm font-semibold">
          Life score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        {authenticated && isLoading ? (
          <Skeleton className="size-24 rounded-full" />
        ) : (
          <div
            className="relative flex size-24 items-center justify-center rounded-full border-4 border-primary/30"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${score * 3.6}deg, hsl(var(--muted)) 0)`,
            }}
          >
            <span className="flex size-[calc(100%-8px)] items-center justify-center rounded-full bg-card text-2xl font-bold tabular-nums">
              {authenticated ? score : "—"}
            </span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          <p>Weighted score: habits, tasks, activity & savings.</p>
          <p className="mt-2 tabular-nums text-foreground">
            {authenticated ? `${totalActivities} activities · ${query.period ?? "week"}` : "Sign in to calculate"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
