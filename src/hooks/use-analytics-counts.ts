"use client";

import { useMemo } from "react";
import { analyticsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";

/** Single shared analytics fetch for all dashboard widgets. */
export function useAnalyticsCounts() {
  const { query } = usePeriod("analytics");
  const stableQuery = useMemo(
    () => query,
    [query.period, query.startDate, query.endDate],
  );

  return useStandData(
    ["analytics", "counts", stableQuery],
    () => analyticsApi.getCounts(stableQuery),
    { enabled: hasAuthToken() },
  );
}
