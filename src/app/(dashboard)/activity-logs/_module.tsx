"use client";

import { useState } from "react";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { activityLogsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

export function ActivityLogsModule({ compact }: { compact?: boolean }) {
  const authenticated = hasAuthToken();
  const { query } = usePeriod("activity-logs");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const pageQuery = { ...query, page, limit };
  const { data, isLoading } = useStandData(
    ["activity-logs", pageQuery],
    () => activityLogsApi.getPage(pageQuery),
    { enabled: authenticated },
  );

  const list = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
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
      )}

      {!authenticated && (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Sign in to view activity logs.
        </div>
      )}

      {authenticated && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-sm font-semibold">
              All activity ({meta?.total ?? list.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityFeed items={list} loading={isLoading} />
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
                <p className="text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Rows
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {[10, 20, 30, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
