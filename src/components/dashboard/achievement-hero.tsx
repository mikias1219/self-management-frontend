"use client";

import { Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { achievementsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0 && r > 0) return `${h}h ${r}m`;
  if (h > 0) return `${h}h`;
  return `${r}m`;
}

export function AchievementHero() {
  const authenticated = hasAuthToken();
  const { query, label } = usePeriod();

  const { data, isLoading } = useStandData(
    ["achievements", query],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  const o = data?.overall;
  const p = data?.plannedVsAchieved;
  const score = o?.score ?? 0;
  const hasPlans = (p?.plannedCount ?? 0) > 0;

  if (!authenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to track planned vs achieved across all modules.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className="relative flex size-24 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${score * 3.6}deg, hsl(var(--muted)) 0deg)`,
            }}
          >
            <div className="flex size-[4.5rem] flex-col items-center justify-center rounded-full bg-card shadow-inner">
              {isLoading ? (
                <Skeleton className="size-10 rounded-full" />
              ) : (
                <>
                  <span className="text-2xl font-bold tabular-nums">{score}</span>
                  <span className="text-[10px] text-muted-foreground">/ 100</span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="size-5" />
              <span className="text-sm font-semibold">
                {hasPlans ? "Plan fulfillment" : "Overall achievement"}
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold tracking-tight">{label}</p>
            {hasPlans && p ? (
              <p className="text-sm text-muted-foreground">
                <Target className="mr-1 inline size-3.5" />
                Planned {formatMinutes(p.plannedMinutes)} → Achieved{" "}
                {formatMinutes(p.achievedMinutes)} ({p.fulfillmentRate}%)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add plans in Tasks with planned duration, then report when done.{" "}
                {o?.finished ?? 0} finished · {o?.achieved ?? 0} achieved
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {(
            [
              {
                label: "Planned",
                value: hasPlans ? p?.plannedCount : "—",
                sub: hasPlans ? formatMinutes(p!.plannedMinutes) : undefined,
                color: "text-foreground",
              },
              {
                label: "Achieved",
                value: hasPlans ? p?.achievedCount : o?.achieved,
                sub: hasPlans ? formatMinutes(p!.achievedMinutes) : undefined,
                color: "text-emerald-600",
              },
              {
                label: "Ongoing",
                value: hasPlans ? p?.ongoingCount : o?.ongoing,
                color: "text-sky-600",
              },
              {
                label: "Fulfillment",
                value: hasPlans ? `${p?.fulfillmentRate}%` : `${o?.completionRate ?? 0}%`,
                color: "text-primary",
              },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              className="rounded-xl border bg-background/80 px-4 py-3 text-center shadow-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              {isLoading ? (
                <Skeleton className="mx-auto mt-2 h-7 w-10" />
              ) : (
                <>
                  <p
                    className={cn(
                      "mt-1 text-xl font-semibold tabular-nums",
                      item.color,
                    )}
                  >
                    {item.value ?? "—"}
                  </p>
                  {"sub" in item && item.sub && (
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
