"use client";

import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Flame,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  EmptyState,
  MetricTile,
  PeriodPills,
  ProgressRing,
} from "@/components/productivity/productivity-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandData } from "@/hooks/use-stand-data";
import { productivityApi } from "@/lib/api";
import type {
  PeriodProductivityMetrics,
  ProductivityMetricsAll,
} from "@/lib/types/productivity";
import { hasAuthToken } from "@/lib/api/client";
import type { AnalyticsPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const PERIOD_KEYS: {
  value: AnalyticsPeriod;
  key: keyof ProductivityMetricsAll;
  label: string;
}[] = [
  { value: "day", key: "daily", label: "Today" },
  { value: "week", key: "weekly", label: "Week" },
  { value: "month", key: "monthly", label: "Month" },
  { value: "year", key: "yearly", label: "Year" },
];

function TrendBars({
  trend,
}: {
  trend: PeriodProductivityMetrics["trend"];
}) {
  const points = trend ?? [];
  if (points.length < 2) return null;

  const maxVal = Math.max(
    1,
    ...points.map((p) => Math.max(p.planned, p.completed)),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1.5 h-32">
        {points.map((p) => {
          const plannedH = (p.planned / maxVal) * 100;
          const doneH = (p.completed / maxVal) * 100;
          const label =
            points.length <= 7
              ? format(parseISO(p.date), "EEE")
              : format(parseISO(p.date), "d");
          return (
            <div
              key={p.date}
              className="flex flex-1 flex-col items-center gap-2 min-w-0"
            >
              <div className="flex w-full max-w-8 items-end justify-center gap-0.5 h-24">
                <div
                  className="w-1.5 rounded-full bg-muted-foreground/20"
                  style={{
                    height: `${plannedH}%`,
                    minHeight: p.planned ? 3 : 0,
                  }}
                />
                <div
                  className="w-1.5 rounded-full bg-primary"
                  style={{
                    height: `${doneH}%`,
                    minHeight: p.completed ? 3 : 0,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Done
        </span>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: number;
  hint?: string;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressView() {
  const authenticated = hasAuthToken();
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");

  const { data: allMetrics, isLoading: loadingAll } = useStandData(
    ["productivity", "metrics"],
    () => productivityApi.getMetrics(),
    { enabled: authenticated },
  );

  const { data: periodMetrics, isLoading: loadingPeriod } = useStandData(
    ["productivity", "metrics", period],
    () => productivityApi.getMetrics(period),
    { enabled: authenticated },
  );

  const m = useMemo(() => {
    if (periodMetrics && "successScore" in periodMetrics) {
      return periodMetrics as PeriodProductivityMetrics;
    }
    const all = allMetrics as ProductivityMetricsAll | undefined;
    if (!all) return null;
    const map: Record<AnalyticsPeriod, keyof ProductivityMetricsAll> = {
      day: "daily",
      week: "weekly",
      month: "monthly",
      quarter: "monthly",
      year: "yearly",
      custom: "weekly",
    };
    return all[map[period]];
  }, [periodMetrics, allMetrics, period]);

  const isLoading = loadingAll || loadingPeriod;

  if (!authenticated) {
    return (
      <EmptyState
        title="Sign in to track progress"
        description="Weekly, monthly, and yearly metrics appear here."
      />
    );
  }

  const rangeLabel = m
    ? `${format(new Date(m.range.start), "MMM d")} – ${format(new Date(m.range.end), "MMM d, yyyy")}`
    : "";

  const timeRate =
    m && m.tasks.plannedMinutes > 0
      ? Math.min(
          100,
          Math.round((m.tasks.spentMinutes / m.tasks.plannedMinutes) * 100),
        )
      : 0;

  const all = allMetrics as ProductivityMetricsAll | undefined;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {rangeLabel ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-primary" />
            {rangeLabel}
          </p>
        ) : (
          <span />
        )}
        <PeriodPills options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {all && "daily" in all && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PERIOD_KEYS.map(({ key, label, value }) => {
            const pm = all[key];
            if (!pm) return null;
            const active = period === value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(value)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition-all",
                  active
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card/60 hover:bg-muted/40",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {pm.successScore}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {pm.tasks.completed}/{pm.tasks.total} tasks
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-3xl border border-border/50 bg-gradient-to-b from-primary/[0.06] to-transparent p-6 flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <Skeleton className="size-28 rounded-full" />
          ) : (
            <>
              <div className="relative">
                <ProgressRing value={m?.successScore ?? 0} size={120} stroke={8} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tabular-nums tracking-tight">
                    {m?.successScore ?? 0}
                  </span>
                  <span className="text-xs text-muted-foreground">overall</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-[200px]">
                Tasks, goals, and habits combined for this period
              </p>
            </>
          )}
        </div>

        <div className="lg:col-span-8 grid gap-3 sm:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          ) : (
            <>
              <MetricTile
                icon={CheckCircle2}
                label="Tasks"
                value={
                  m ? `${m.tasks.completed}/${m.tasks.total}` : "—"
                }
                sub={
                  m
                    ? `${m.tasks.completionRate}% · ${m.tasks.overdue} overdue`
                    : undefined
                }
                accent="sky"
              />
              <MetricTile
                icon={Timer}
                label="Focus time"
                value={m ? `${m.tasks.spentMinutes}m` : "—"}
                sub={
                  m
                    ? `${m.tasks.plannedMinutes}m planned · ${timeRate}%`
                    : undefined
                }
                accent="emerald"
              />
              <MetricTile
                icon={Target}
                label="Goals"
                value={m ? `${m.goals.avgProgress}%` : "—"}
                sub={
                  m
                    ? `${m.goals.active} active · ${m.goals.completed} complete`
                    : undefined
                }
                accent="violet"
              />
              <MetricTile
                icon={Flame}
                label="Habits"
                value={m ? `${m.habits.completionRate}%` : "—"}
                sub={
                  m
                    ? `${m.habits.logsCount} of ${m.habits.targetLogs ?? "—"} check-ins`
                    : undefined
                }
                accent="amber"
              />
            </>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card/50 p-6 space-y-5">
        <h3 className="text-sm font-semibold">Breakdown</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <BreakdownRow
              label="Task completion"
              value={m?.tasks.completionRate ?? 0}
              hint={
                m
                  ? `${m.tasks.completedInPeriod ?? m.tasks.completed} done · ${m.tasks.open} open`
                  : undefined
              }
              color="bg-primary"
            />
            <BreakdownRow
              label="Goals"
              value={m?.goals.avgProgress ?? 0}
              hint={
                m
                  ? Object.entries(m.goals.byLevel)
                      .filter(([, n]) => n > 0)
                      .map(([l, n]) => `${l}: ${n}`)
                      .join(" · ") || "No goals"
                  : undefined
              }
              color="bg-violet-500"
            />
            <BreakdownRow
              label="Habits"
              value={m?.habits.completionRate ?? 0}
              hint={
                m
                  ? `${m.habits.logsCount} logs · ${m.habits.totalHabits} habits`
                  : undefined
              }
              color="bg-amber-500"
            />
            <BreakdownRow
              label="Time on plan"
              value={timeRate}
              color="bg-emerald-500"
            />
          </>
        )}
      </div>

      {m && (m.trend?.length ?? 0) > 1 && (
        <div className="rounded-3xl border border-border/50 bg-card/50 p-6">
          <h3 className="text-sm font-semibold mb-1">Daily activity</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Planned vs completed tasks
          </p>
          <TrendBars trend={m.trend} />
        </div>
      )}
    </div>
  );
}
