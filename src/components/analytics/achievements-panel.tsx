"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { achievementsApi } from "@/lib/api/achievements";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

export function AchievementsPanel() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod("achievements");

  const { data, isLoading } = useStandData(
    ["achievements", query],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  if (isLoading && !data) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">No achievement data yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-amber-600" />
            Overall score
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-semibold tabular-nums">{data.overall.score}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Achieved</p>
            <p className="text-2xl font-semibold tabular-nums">{data.overall.achieved}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ongoing</p>
            <p className="text-2xl font-semibold tabular-nums">{data.overall.ongoing}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completion</p>
            <p className="text-2xl font-semibold tabular-nums">
              {Math.round(data.overall.completionRate)}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.modules.map((mod) => (
          <Card key={mod.module}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Link href={mod.href} className="hover:underline">
                  {mod.label}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">{mod.achieved} achieved</Badge>
                <Badge variant="outline">{mod.ongoing} ongoing</Badge>
                <Badge variant="outline">{mod.notStarted} not started</Badge>
              </div>
              {mod.highlights.slice(0, 3).map((h) => (
                <p key={h.id} className="text-sm text-muted-foreground">
                  {h.title}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
