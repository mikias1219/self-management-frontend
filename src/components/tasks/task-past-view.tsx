"use client";

import { format, startOfWeek, endOfWeek } from "date-fns";
import { History } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStandData } from "@/hooks/use-stand-data";
import { achievementsApi, tasksApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type { Task } from "@/lib/types";
import type { DateRangeQuery } from "@/lib/types";
import { formatMinutes } from "@/lib/utils/time-input";

interface TaskPastViewProps {
  query: DateRangeQuery;
  label: string;
}

function groupByWeek(tasks: Task[]) {
  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const weekStart = format(
      startOfWeek(new Date(t.completedAt), { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const list = groups.get(weekStart) ?? [];
    list.push(t);
    groups.set(weekStart, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}

export function TaskPastView({ query, label }: TaskPastViewProps) {
  const authenticated = hasAuthToken();
  const completedQuery = useMemo(
    () => ({
      taskStatus: "done" as const,
      completedFrom: query.startDate,
      completedTo: query.endDate,
    }),
    [query.startDate, query.endDate],
  );

  const { data: completedTasks, isLoading } = useStandData(
    ["tasks", "past", completedQuery],
    () => tasksApi.getAll(completedQuery),
    { enabled: authenticated },
  );

  const { data: achievements } = useStandData(
    ["achievements", query.period ?? "month"],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  const weeks = useMemo(
    () => groupByWeek(completedTasks ?? []),
    [completedTasks],
  );

  const totals = useMemo(() => {
    const tasks = completedTasks ?? [];
    const planned = tasks.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
    const achieved = tasks.reduce((s, t) => s + (t.timeSpentMinutes ?? 0), 0);
    return { planned, achieved, count: tasks.length };
  }, [completedTasks]);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading history…</p>
    );
  }

  return (
    <div className="space-y-4">
      {achievements && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="size-4" />
              Achievement summary — {label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {achievements.plannedVsAchieved && (
              <p>
                Planned {formatMinutes(achievements.plannedVsAchieved.plannedMinutes)} · Achieved{" "}
                {formatMinutes(achievements.plannedVsAchieved.achievedMinutes)} (
                {achievements.plannedVsAchieved.fulfillmentRate}% fulfillment)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-semibold tabular-nums">{totals.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Planned time</p>
            <p className="text-2xl font-semibold">{formatMinutes(totals.planned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Achieved time</p>
            <p className="text-2xl font-semibold">{formatMinutes(totals.achieved)}</p>
          </CardContent>
        </Card>
      </div>

      {weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No completed tasks in this period.
        </p>
      ) : (
        weeks.map(([weekStart, tasks]) => (
          <div key={weekStart} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Week of {weekStart}
            </h3>
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border px-3 py-2 text-sm flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-medium">{t.title}</p>
                    {t.completionNote && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.completionNote}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {t.lifeArea && <Badge variant="outline">{t.lifeArea}</Badge>}
                    <span>
                      {formatMinutes(t.timeSpentMinutes)} /{" "}
                      {formatMinutes(t.estimatedMinutes ?? 0)}
                    </span>
                    {t.completedAt && (
                      <span>{format(new Date(t.completedAt), "MMM d")}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
