"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { activityLogsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function RecentActivities() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["activity-logs"],
    () => activityLogsApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeed
          items={list.slice(0, 12)}
          loading={authenticated && isLoading}
          emptyMessage={
            authenticated
              ? "No activity logged yet"
              : "Sign in to see activity"
          }
        />
      </CardContent>
    </Card>
  );
}
