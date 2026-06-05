"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  CheckSquare,
  Clock,
  Flame,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HubOverview } from "@/components/dashboard/hub-overview";
import { authApi, dashboardApi, financeApi, productivityApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";
import { formatMoney } from "@/lib/utils/period";
import { cn } from "@/lib/utils";

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

/** Personal OS dashboard — one calm, scannable view of the day. */
export function DashboardOverview() {
  const authenticated = hasAuthToken();

  const { data, isLoading } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authenticated },
  );
  const { data: today } = useStandData(
    ["productivity", "schedule", "today"],
    () => productivityApi.getSchedule({ scope: "today" }),
    { enabled: authenticated },
  );
  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authenticated,
  });

  const { data: budgets } = useStandData(
    ["finance", "budgets"],
    () => financeApi.budgets.getAll(),
    { enabled: authenticated },
  );

  if (!authenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Sign in to see your Personal OS dashboard.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currency = data.financialSnapshot.currency;
  const success = today?.todaySuccess;
  const monthNet =
    data.financialSnapshot.monthlyIncome - data.financialSnapshot.monthlyExpense;
  const firstName = user?.displayName?.split(" ")[0];

  const kpis = [
    {
      label: "Today's score",
      value: `${success?.successScore ?? 0}%`,
      icon: TrendingUp,
      tint: "text-violet-600",
      progress: success?.successScore ?? 0,
    },
    {
      label: "Tasks done",
      value: `${success?.tasksCompleted ?? 0}/${success?.tasksPlanned ?? 0}`,
      icon: CheckSquare,
      tint: "text-sky-600",
    },
    {
      label: "Focused time",
      value: formatMinutes(success?.minutesAchieved ?? 0),
      sub: `of ${formatMinutes(success?.minutesPlanned ?? 0)} planned`,
      icon: Clock,
      tint: "text-amber-600",
    },
    {
      label: "Net balance",
      value: formatMoney(data.financialSnapshot.netBalance, currency),
      icon: Wallet,
      tint:
        data.financialSnapshot.netBalance >= 0
          ? "text-emerald-600"
          : "text-rose-600",
    },
  ];

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

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-start gap-2.5 py-4">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed">{data.aiInsight}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
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
                <p className="text-xl font-semibold tabular-nums">{k.value}</p>
                {k.sub && (
                  <p className="text-xs text-muted-foreground">{k.sub}</p>
                )}
                {k.progress !== undefined && (
                  <Progress value={k.progress} className="h-1.5" />
                )}
              </CardContent>
            </Card>
          );
        })}
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
            {data.todayFocus.tasks.length === 0 ? (
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
            {data.taskStatus.overdue > 0 && (
              <p className="text-xs text-rose-600">
                {data.taskStatus.overdue} overdue —{" "}
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
            <div>
              <p className="text-xs text-muted-foreground">Income received</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatMoney(data.financialSnapshot.monthlyIncome, currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Budgeted monthly expenses
              </p>
              <div className="space-y-1.5">
                {(budgets ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No budgets yet — create them in Finance
                  </p>
                ) : (
                  (budgets ?? []).slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="truncate pr-2">{b.name}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">
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
                  Math.max(
                    0,
                    data.financialSnapshot.monthlyIncome -
                      (budgets?.reduce((s, b) => s + b.amount, 0) ?? 0),
                  ),
                  currency,
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Jump into a life area
        </p>
        <HubOverview />
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
