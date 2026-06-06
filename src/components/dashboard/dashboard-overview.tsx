"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bot,
  CheckSquare,
  Clock,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi, activityLogsApi, dashboardApi, financeApi, productivityApi } from "@/lib/api";
import { useHasAuthToken } from "@/hooks/use-has-auth-token";
import { useStandData } from "@/hooks/use-stand-data";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";

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

/** Personal OS dashboard — progressive sections, no full-page blocking. */
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

  const { data: budgets, isLoading: budgetsLoading } = useStandData(
    ["finance", "budgets"],
    () => financeApi.budgets.getAll(),
    { enabled: authReady, staleTime: 30_000 },
  );

  const { data: recentActivity } = useStandData(
    ["activity-logs", "dashboard-recent"],
    () => activityLogsApi.getByPeriod({ period: "week" }),
    { enabled: authReady, staleTime: 60_000 },
  );

  if (authenticated === null) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="h-24" />
            </Card>
          ))}
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

  const kpis = data
    ? [
        {
          label: "Today's score",
          value: `${success?.successScore ?? 0}%`,
          icon: TrendingUp,
          tint: "text-violet-600",
          progress: success?.successScore ?? 0,
        },
        {
          label: "Savings rate",
          value: formatPercent(data.financialSnapshot.savingsRate),
          icon: Wallet,
          tint: savingsRateColor(data.financialSnapshot.savingsRate),
        },
        {
          label: "Studied today",
          value: formatMinutes(data.todayFocus.studyMinutes),
          icon: GraduationCap,
          tint: "text-emerald-600",
        },
      ]
    : null;

  const insightLink = data ? insightActionLink(data.aiInsight) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}.
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d")} — here is your day at a glance.
        </p>
      </div>

      {overviewLoading && !data ? (
        <Card className="border-primary/20">
          <CardContent className="py-4">
            <Skeleton className="h-4 w-full max-w-xl" />
          </CardContent>
        </Card>
      ) : data ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex items-start justify-between gap-3 py-4">
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm leading-relaxed">{data.aiInsight}</p>
                {insightLink && (
                  <Link
                    href={insightLink.href}
                    className="inline-flex items-center gap-0.5 text-xs text-primary"
                  >
                    {insightLink.label} <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              className="shrink-0"
              onClick={() =>
                openAiChat(
                  `Based on this insight, help me take action: "${data.aiInsight}"`,
                )
              }
            >
              <Bot className="size-3.5" />
              Ask AI Coach
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis
          ? kpis.map((k) => {
              const Icon = k.icon;
              return (
                <Card key={k.label} className="border shadow-sm">
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        {k.label}
                      </p>
                      <Icon className={cn("size-4", k.tint)} />
                    </div>
                    <p className={cn("text-xl font-semibold tabular-nums", k.tint)}>
                      {k.value}
                    </p>
                    {k.progress !== undefined && (
                      <Progress value={k.progress} className="h-1.5" />
                    )}
                  </CardContent>
                </Card>
              );
            })
          : [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border shadow-sm">
                <CardContent className="h-24" />
              </Card>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CheckSquare className="size-4 text-sky-600" />
                Focus today
              </CardTitle>
              <Link
                href="/productivity"
                className="inline-flex items-center gap-0.5 text-xs text-primary"
              >
                Open <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!data ? (
              <Skeleton className="h-32 w-full" />
            ) : data.todayFocus.tasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No tasks due today. Plan one in Productivity.
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
                <Link href="/productivity" className="underline">
                  catch up
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="size-4 text-emerald-600" />
                Finance
              </CardTitle>
              <Link
                href="/life?tab=finance"
                className="inline-flex items-center gap-0.5 text-xs text-primary"
              >
                Open <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Income received</p>
                    <p className="text-xl font-semibold tabular-nums">
                      {formatMoney(data.financialSnapshot.monthlyIncome, currency)}
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

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    Budgeted monthly expenses
                  </p>
                  <div className="space-y-1.5">
                    {budgetsLoading && !budgets ? (
                      <Skeleton className="h-12 w-full" />
                    ) : (budgets ?? []).length === 0 ? (
                      <p className="text-xs italic text-muted-foreground">
                        No budgets yet — create them in Finance
                      </p>
                    ) : (
                      (budgets ?? []).slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="truncate pr-2">{b.name}</span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {formatMoney(b.amount, currency)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Available for savings / buffer
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-emerald-600">
                    {formatMoney(
                      Math.max(0, data.financialSnapshot.remainingUnallocated),
                      currency,
                    )}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {data ? (
          <>
            <MomentumCard
              icon={Flame}
              tint="text-orange-600"
              label="Habits today"
              value={`${success?.habitsDone ?? 0}/${success?.habitsTotal ?? 0}`}
              progress={
                success?.habitsTotal
                  ? Math.round((success.habitsDone / success.habitsTotal) * 100)
                  : 0
              }
            />
            <MomentumCard
              icon={Target}
              tint="text-sky-600"
              label="Productivity"
              value={`${data.scores.productivityScore}/100`}
              progress={data.scores.productivityScore}
            />
            <MomentumCard
              icon={Clock}
              tint="text-emerald-600"
              label="Studied today"
              value={formatMinutes(data.todayFocus.studyMinutes)}
            />
          </>
        ) : (
          [1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border shadow-sm">
              <CardContent className="h-20" />
            </Card>
          ))
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Recent activity
          </p>
          <Link
            href="/insights?tab=activity"
            className="inline-flex items-center gap-0.5 text-xs text-primary"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        <Card className="border shadow-sm">
          <CardContent className="py-3">
            {(recentActivity ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              <ul className="divide-y">
                {(recentActivity ?? []).slice(0, 3).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <span className="truncate">
                      {entry.description ??
                        `${entry.action} ${entry.entityType}`}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MomentumCard({
  icon: Icon,
  tint,
  label,
  value,
  progress,
}: {
  icon: typeof Flame;
  tint: string;
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-2 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className={cn("size-4", tint)} />
        </div>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        {progress !== undefined && (
          <Progress value={progress} className="h-1.5" />
        )}
      </CardContent>
    </Card>
  );
}
