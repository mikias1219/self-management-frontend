"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Bot,
  Calendar,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { TodayView } from "@/components/productivity/today-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  authApi,
  dashboardApi,
  financeApi,
  habitsApi,
  productivityApi,
} from "@/lib/api";
import { useHasAuthToken } from "@/hooks/use-has-auth-token";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";
import { toast } from "sonner";
import { useMemo } from "react";

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function TodayHubView() {
  const authenticated = useHasAuthToken();
  const authReady = authenticated === true;
  const openAiChat = useStandUi((s) => s.openAiChat);

  const { data: overview, isLoading } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authReady, staleTime: 30_000 },
  );
  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authReady,
  });
  const { data: finance } = useStandData(
    ["finance", "summary", "today"],
    () => financeApi.getSummary({ period: "day" }),
    { enabled: authReady },
  );
  const { data: habits } = useStandData(
    ["habits"],
    () => habitsApi.getAll(),
    { enabled: authReady },
  );
  const { data: schedule } = useStandData(
    ["productivity", "schedule", "today"],
    () => productivityApi.getSchedule({ scope: "today" }),
    { enabled: authReady },
  );

  const loggedTodayIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of schedule?.items ?? []) {
      if (item.kind === "habit" && item.status === "done") {
        ids.add(item.entityId);
      }
    }
    return ids;
  }, [schedule?.items]);

  const checkIn = useStandMutation(
    (habitId: string) =>
      habitsApi.createLog(habitId, { completedAt: new Date().toISOString() }),
    {
      invalidateKeys: [
        ["habits"],
        ["productivity", "schedule", "today"],
        ["dashboard"],
      ],
      onSuccess: () => toast.success("Habit logged"),
    },
  );

  const aiInsight = overview?.aiInsight;
  const insightText =
    typeof aiInsight === "string" ? aiInsight : aiInsight?.text ?? "";
  const insightHref =
    typeof aiInsight === "object" && aiInsight?.actionHref
      ? aiInsight.actionHref
      : "/productivity?tab=tasks";

  const todaySpend = finance?.totals.totalExpense ?? 0;
  const dailyBudget =
    finance?.currentCycle && finance.currentCycle.spendingBudget > 0
      ? finance.currentCycle.spendingBudget /
        Math.max(
          1,
          Math.ceil(
            (new Date(finance.currentCycle.endDate).getTime() -
              new Date(finance.currentCycle.startDate).getTime()) /
              86400000,
          ) + 1,
        )
      : 0;
  const spendPct =
    dailyBudget > 0 ? Math.min(100, (todaySpend / dailyBudget) * 100) : 0;

  if (!authReady) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Sign in to see your day.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {user?.firstName ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        {schedule?.todaySuccess && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Today&apos;s score</p>
            <p className="text-2xl font-bold tabular-nums">
              {schedule.todaySuccess.successScore}
            </p>
          </div>
        )}
      </div>

      {insightText && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
              <p className="text-sm">{insightText}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={insightHref}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Take action
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAiChat("What should I focus on today?")}
              >
                <Bot className="size-3.5" />
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="size-4" />
              Today&apos;s spending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatMoney(todaySpend, "ETB")}
                  {dailyBudget > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      / {formatMoney(dailyBudget, "ETB")} daily budget
                    </span>
                  )}
                </p>
                {dailyBudget > 0 && <Progress value={spendPct} className="h-2" />}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="size-4" />
              Bills due this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(finance?.obligations.upcoming.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No bills due soon.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {finance?.obligations.upcoming.slice(0, 5).map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between rounded border px-2 py-1.5"
                  >
                    <span>{o.name}</span>
                    <span className="text-muted-foreground">
                      {o.dueDate} · {formatMoney(o.expectedAmount, "ETB")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {(finance?.obligations.overdue.length ?? 0) > 0 && (
              <Link
                href="/life?tab=finance&sub=obligations"
                className="mt-2 inline-block text-xs text-destructive underline"
              >
                {finance!.obligations.overdue.length} overdue — pay now
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {(habits ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="size-4" />
              Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(habits ?? []).slice(0, 8).map((h) => {
              const done = loggedTodayIds.has(h.id);
              return (
                <Button
                  key={h.id}
                  size="sm"
                  variant={done ? "secondary" : "outline"}
                  disabled={done || checkIn.isPending}
                  onClick={() => checkIn.mutate(h.id)}
                >
                  {h.name}
                  {done && (
                    <Badge variant="outline" className="ml-1.5">
                      Done
                    </Badge>
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-medium mb-3">Schedule</h2>
        <TodayView />
      </div>
    </div>
  );
}
