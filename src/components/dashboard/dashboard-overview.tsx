"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  Bot,
  Check,
  DollarSign,
  GraduationCap,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
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
import type { PosDashboardOverview } from "@/lib/types/dashboard";

function savingsRateColor(rate: number) {
  if (rate > 15) return "text-emerald-600";
  if (rate >= 5) return "text-amber-600";
  return "text-red-600";
}

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return `${r}m`;
}

function insightActionLink(insight: string): { href: string; label: string } | null {
  const lower = insight.toLowerCase();
  if (lower.includes("overdue task")) {
    return { href: "/productivity?tab=tasks", label: "Go to tasks" };
  }
  if (
    lower.includes("finance") ||
    lower.includes("budget") ||
    lower.includes("expense") ||
    lower.includes("salary") ||
    lower.includes("obligation")
  ) {
    return { href: "/life?tab=finance", label: "Go to finance" };
  }
  return null;
}

function getAiInsight(insight: PosDashboardOverview["aiInsight"]) {
  if (typeof insight === "string") {
    const link = insightActionLink(insight);
    return {
      text: insight,
      href: link?.href ?? "/today",
      label: link?.label ?? "Open Today",
    };
  }
  return {
    text: insight.text,
    href: insight.actionHref,
    label: "Take action",
  };
}

/** Personal OS dashboard — three compact sections, one screen. */
export function DashboardOverview() {
  const authenticated = useHasAuthToken();
  const authReady = authenticated === true;
  const openAiChat = useStandUi((s) => s.openAiChat);

  const { data, isLoading: overviewLoading } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authReady, staleTime: 30_000 },
  );
  const { data: today } = useStandData(
    ["productivity", "schedule", "today"],
    () => productivityApi.getSchedule({ scope: "today" }),
    { enabled: authReady, staleTime: 30_000 },
  );
  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authReady,
    staleTime: 120_000,
  });
  const { data: habits } = useStandData(
    ["habits"],
    () => habitsApi.getAll(),
    { enabled: authReady, staleTime: 30_000 },
  );
  const { data: financeSummary } = useStandData(
    ["finance", "summary", "dashboard"],
    () => financeApi.getSummary(),
    { enabled: authReady, staleTime: 30_000 },
  );

  const loggedTodayIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of today?.items ?? []) {
      if (item.kind === "habit" && item.status === "done") {
        ids.add(item.entityId);
      }
    }
    return ids;
  }, [today?.items]);

  const checkIn = useStandMutation(
    (habitId: string) =>
      habitsApi.createLog(habitId, {
        completedAt: new Date().toISOString(),
      }),
    {
      invalidateKeys: [
        ["habits"],
        ["dashboard"],
        ["productivity", "schedule", "today"],
      ],
      onSuccess: () => toast.success("Checked in!"),
      onError: () => toast.error("Already logged or failed"),
    },
  );

  if (authenticated === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-14 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Sign in to see your Personal OS dashboard.
        </CardContent>
      </Card>
    );
  }

  const firstName = user?.displayName?.split(" ")[0];
  const success = today?.todaySuccess;
  const currency = data?.financialSnapshot.currency ?? "ETB";
  const habitList = habits ?? [];
  const overdue = financeSummary?.obligations.overdue ?? [];
  const upcoming = financeSummary?.obligations.upcoming ?? [];
  const dueObligations = [...overdue, ...upcoming].slice(0, 3);
  const healthScore =
    financeSummary?.currentCycle?.financialHealthScore ??
    data?.scores.financialHealthScore ??
    0;

  const kpis = data
    ? [
        {
          label: "Today's score",
          value: `${success?.successScore ?? 0}%`,
          tint: "text-violet-600",
        },
        {
          label: "Savings rate",
          value: formatPercent(data.financialSnapshot.savingsRate),
          tint: savingsRateColor(data.financialSnapshot.savingsRate),
        },
        {
          label: "Task completion",
          value: formatPercent(data.taskStatus.completionRate),
          tint: "text-sky-600",
        },
        {
          label: "Overdue bills",
          value: String(financeSummary?.obligations.overdue.length ?? data.taskStatus.overdue),
          tint: (financeSummary?.obligations.overdue.length ?? 0) > 0 ? "text-red-600" : "text-muted-foreground",
        },
        {
          label: "Studied today",
          value: formatMinutes(data.todayFocus.studyMinutes),
          tint: "text-emerald-600",
        },
      ]
    : null;

  const insight = data ? getAiInsight(data.aiInsight) : null;

  return (
    <div className="space-y-5">
      {/* Section 1: Greeting + AI insight */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {greeting()}
              {firstName ? `, ${firstName}` : ""}.
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          {data && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() =>
                openAiChat(
                  `Based on this insight, help me take action: "${insight?.text ?? data.aiInsight}"`,
                )
              }
            >
              <Bot className="size-3.5" />
              Ask AI Coach
            </Button>
          )}
        </div>

        {overviewLoading && !data ? (
          <Skeleton className="h-14 w-full rounded-lg" />
        ) : data ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm leading-relaxed">{insight?.text}</p>
                {insight && (
                  <Link
                    href={insight.href}
                    className="inline-flex items-center gap-0.5 text-xs text-primary"
                  >
                    {insight.label} <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Section 2: KPIs + quick finance actions */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {kpis
          ? kpis.map((k) => (
              <Card key={k.label} className="border shadow-sm">
                <CardContent className="py-3">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {k.label}
                  </p>
                  <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", k.tint)}>
                    {k.value}
                  </p>
                </CardContent>
              </Card>
            ))
          : [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border shadow-sm">
                <CardContent className="h-16" />
              </Card>
            ))}
        <Link
          href="/life"
          className={cn(
            buttonVariants(),
            "h-auto min-h-[4.5rem] flex-col gap-1 py-3",
          )}
        >
          <Receipt className="size-4" />
          Log expense
        </Link>
        <Link
          href="/life"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto min-h-[4.5rem] flex-col gap-1 py-3",
          )}
        >
          <DollarSign className="size-4" />
          Log salary
        </Link>
      </div>

      {/* Section 3: Today + Finance pulse */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today&apos;s focus
            </p>
            <Link
              href="/today"
              className="inline-flex items-center gap-0.5 text-xs text-primary"
            >
              Open Today hub <ArrowRight className="size-3" />
            </Link>
          </div>
          <Card className="border shadow-sm">
            <CardContent className="space-y-4 py-4">
              {!data ? (
                <Skeleton className="h-32 w-full" />
              ) : data.todayFocus.tasks.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No tasks due today.
                </p>
              ) : (
                <ul className="divide-y">
                  {data.todayFocus.tasks.slice(0, 5).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 py-2 text-sm"
                    >
                      <span className="truncate">{t.title}</span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] capitalize"
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}

              {(data?.taskStatus.overdue ?? 0) > 0 && (
                <p className="text-xs text-rose-600">
                  {data?.taskStatus.overdue} overdue —{" "}
                  <Link href="/productivity?tab=tasks" className="underline">
                    catch up
                  </Link>
                </p>
              )}

              {habitList.length > 0 && (
                <>
                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Habits
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {habitList.slice(0, 8).map((habit) => {
                        const done = loggedTodayIds.has(habit.id);
                        return (
                          <button
                            key={habit.id}
                            type="button"
                            disabled={done || checkIn.isPending}
                            onClick={() => checkIn.mutate(habit.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                              done
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                                : "border-border bg-muted/40 hover:bg-muted",
                            )}
                          >
                            {done && <Check className="size-3" />}
                            {habit.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Finance pulse
            </p>
            <Link
              href="/life"
              className="inline-flex items-center gap-0.5 text-xs text-primary"
            >
              Open <ArrowRight className="size-3" />
            </Link>
          </div>
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="size-4 text-emerald-600" />
                Cycle health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!data ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Health score</p>
                      <p className="text-xl font-semibold tabular-nums">
                        {healthScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings rate</p>
                      <p
                        className={cn(
                          "text-xl font-semibold tabular-nums",
                          savingsRateColor(data.financialSnapshot.savingsRate),
                        )}
                      >
                        {formatPercent(data.financialSnapshot.savingsRate)}
                      </p>
                    </div>
                  </div>
                  <Progress value={healthScore} className="h-2" />

                  {financeSummary?.currentCycle && (
                    <p className="text-xs text-muted-foreground">
                      Cycle {financeSummary.currentCycle.startDate} →{" "}
                      {financeSummary.currentCycle.endDate} · Unallocated{" "}
                      {formatMoney(
                        Math.max(0, data.financialSnapshot.remainingUnallocated),
                        currency,
                      )}
                    </p>
                  )}

                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Due obligations
                    </p>
                    {dueObligations.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No bills due soon.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {dueObligations.map((o) => {
                          const isOverdue = overdue.some((x) => x.id === o.id);
                          return (
                            <li
                              key={o.id}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs",
                                isOverdue
                                  ? "bg-destructive/5 text-destructive"
                                  : "bg-muted/40",
                              )}
                            >
                              <span className="truncate">{o.name}</span>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="tabular-nums">
                                  {formatMoney(o.expectedAmount, currency)}
                                </span>
                                <Link
                                  href="/life?tab=finance"
                                  className={buttonVariants({
                                    variant: "outline",
                                    size: "xs",
                                  })}
                                >
                                  Pay
                                </Link>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
