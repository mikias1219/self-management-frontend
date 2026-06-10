"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Bot, ChevronDown, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { TodayView } from "@/components/productivity/today-view";
import { DailyFocusCard } from "@/components/shared/daily-focus-card";
import { HabitsTodaySection } from "@/components/shared/habits-today-section";
import { BillsDueSoon } from "@/components/shared/bills-due-soon";
import { WeeklySnapshotCard } from "@/components/shared/weekly-snapshot-card";
import { EveningReview } from "@/components/today/evening-review";
import { WeeklyReviewPrompt } from "@/components/today/weekly-review-prompt";
import { OnboardingChecklist } from "@/components/today/onboarding-checklist";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi, dashboardApi, productivityApi } from "@/lib/api";
import { useHasAuthToken } from "@/hooks/use-has-auth-token";
import { useStandData } from "@/hooks/use-stand-data";
import { greeting } from "@/lib/utils/greeting";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";
import type { PosDashboardOverview } from "@/lib/types/dashboard";

function savingsRateColor(rate: number) {
  if (rate > 15) return "text-emerald-600";
  if (rate >= 5) return "text-amber-600";
  return "text-red-600";
}

function getAiInsight(insight: PosDashboardOverview["aiInsight"]) {
  if (typeof insight === "string") {
    return { text: insight, href: "/productivity?tab=tasks", label: "Take action" };
  }
  return {
    text: insight.text,
    href: insight.actionHref,
    label: "Take action",
  };
}

/** Unified command centre — greeting, KPIs, today's agenda, weekly snapshot. */
export function TodayHubView() {
  const authenticated = useHasAuthToken();
  const authReady = authenticated === true;
  const openAiChat = useStandUi((s) => s.openAiChat);
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authReady, staleTime: 60_000 },
  );
  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authReady,
    staleTime: 120_000,
  });
  const { data: todaySummary, isLoading: summaryLoading } = useStandData(
    ["productivity", "today-summary"],
    () => productivityApi.getTodaySummary(),
    { enabled: authReady, staleTime: 60_000 },
  );

  const insight = overview ? getAiInsight(overview.aiInsight) : null;

  const kpis = useMemo(() => {
    if (!overview) return null;
    return [
      {
        label: "Productivity score",
        value: `${overview.scores.productivityScore}`,
        tint: "text-violet-600",
      },
      {
        label: "Savings rate",
        value: formatPercent(overview.financialSnapshot.savingsRate),
        tint: savingsRateColor(overview.financialSnapshot.savingsRate),
      },
      {
        label: "Task completion",
        value: formatPercent(overview.taskStatus.completionRate),
        tint: "text-sky-600",
      },
      {
        label: "Overdue bills",
        value: String(todaySummary?.obligations?.filter((o) => o.status === "overdue").length ?? overview.taskStatus.overdue),
        tint:
          (todaySummary?.obligations?.filter((o) => o.status === "overdue").length ?? 0) > 0
            ? "text-red-600"
            : "text-muted-foreground",
      },
    ];
  }, [overview, todaySummary]);

  if (!authReady) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Sign in to see your day.
      </div>
    );
  }

  if ((overviewLoading || summaryLoading) && !overview && !todaySummary) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const tasks = todaySummary?.tasks ?? [];
  const habits = todaySummary?.habits ?? [];
  const obligations = todaySummary?.obligations ?? [];
  const habitsLogged = habits.filter((h) => h.logged).length;
  const weekly = overview?.intelligence?.weeklyPerformance;
  const currency = overview?.financialSnapshot.currency ?? "ETB";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Section 1: Today's pulse */}
      <section aria-labelledby="today-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="today-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              {greeting()}, {user?.firstName ?? "there"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
            onClick={() =>
              openAiChat(
                insight?.text
                  ? `Based on this insight, help me take action: "${insight.text}"`
                  : "What should I focus on today?",
              )
            }
          >
            <Bot className="size-3.5" />
            Ask AI
          </Button>
        </div>

        {insight?.text && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
                <p className="text-sm leading-relaxed">{insight.text}</p>
              </div>
              <Link
                href={insight.href}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}
              >
                {insight.label}
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis
            ? kpis.map((k) => (
                <Card key={k.label} className="border shadow-sm">
                  <CardContent className="py-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {k.label}
                    </p>
                    <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", k.tint)}>
                      {k.value}
                    </p>
                  </CardContent>
                </Card>
              ))
            : [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
        </div>
      </section>

      <OnboardingChecklist
        hasHabits={habits.length > 0}
        hasTasks={tasks.length > 0}
        hasBudget={(overview?.financialSnapshot.monthlyIncome ?? 0) > 0}
      />

      <WeeklyReviewPrompt />

      {/* Section 2: Today's agenda */}
      <section aria-labelledby="agenda-heading" className="space-y-4">
        <h2 id="agenda-heading" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Today&apos;s agenda
        </h2>

        <DailyFocusCard tasks={tasks} />

        <div className="grid gap-4 lg:grid-cols-2">
          <HabitsTodaySection habits={habits} />
          <BillsDueSoon bills={obligations} currency={currency} />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Schedule</h3>
          <TodayView />
        </div>
      </section>

      <EveningReview
        reviewExists={todaySummary?.reviewExists ?? false}
        stats={{
          tasksDone: tasks.filter((t) => t.taskStatus === "done").length,
          habitsLogged,
        }}
      />

      {/* Section 3: Weekly snapshot (collapsible) */}
      {weekly && (
        <section aria-labelledby="weekly-heading">
          <Button
            id="weekly-heading"
            type="button"
            variant="ghost"
            className="w-full justify-between px-0 hover:bg-transparent"
            onClick={() => setWeeklyOpen((o) => !o)}
            aria-expanded={weeklyOpen}
          >
            <span className="text-sm font-medium">Weekly snapshot</span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                weeklyOpen && "rotate-180",
              )}
            />
          </Button>
          {weeklyOpen && (
            <div className="pt-2">
              <WeeklySnapshotCard
                tasksCompleted={weekly.tasksCompleted}
                habitsStreak={0}
                moneyVsBudget={formatMoney(weekly.weeklyNet, currency)}
                studyMinutes={overview?.todayFocus.studyMinutes ?? 0}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
