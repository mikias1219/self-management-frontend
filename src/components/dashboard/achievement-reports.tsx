"use client";

import { formatDistanceToNow } from "date-fns";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementStatusBadge } from "@/components/dashboard/achievement-status-badge";
import { achievementsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

export function AchievementReports() {
  const authenticated = hasAuthToken();
  const { query, label } = usePeriod();

  const { data, isLoading } = useStandData(
    ["achievements", query],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  if (!authenticated) return null;

  const reports = data?.reports ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Completion report</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Finished and achieved items for {label.toLowerCase()} — logged when you
          complete tasks, goals, habits, and more.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No completions recorded for this period yet. Finish a task, log a
            habit, or hit a goal milestone to see reports here.
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {r.moduleLabel}
                    </span>
                    <AchievementStatusBadge status={r.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium">{r.title}</p>
                  {r.description && (
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  )}
                </div>
                <time
                  className="shrink-0 text-[10px] text-muted-foreground"
                  dateTime={r.finishedAt}
                >
                  {formatDistanceToNow(new Date(r.finishedAt), {
                    addSuffix: true,
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
