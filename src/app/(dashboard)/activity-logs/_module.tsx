"use client";

import { ActivityFeed } from "@/components/shared/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityLogsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

export function ActivityLogsModule() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod();

  const { data, isLoading } = useStandData(
    ["activity-logs", query],
    () => activityLogsApi.getByPeriod(query),
    { enabled: authenticated },
  );
  const list = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Activity Logs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of actions across all LifeOS modules.
          </p>
        </div>
      </div>

      {!authenticated && (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Sign in to view activity logs.
        </div>
      )}

      {authenticated && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-sm font-semibold">
              All activity ({list.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={list} loading={isLoading} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
