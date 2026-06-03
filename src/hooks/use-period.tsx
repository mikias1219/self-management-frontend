"use client";

import { useMemo } from "react";
import { buildPeriodQuery, useStandPeriod } from "@/stores/use-stand";

/** Period filter API — backed by useStand (Zustand), not useState. */
export function usePeriod() {
  const period = useStandPeriod((s) => s.period);
  const customStart = useStandPeriod((s) => s.customStart);
  const customEnd = useStandPeriod((s) => s.customEnd);
  const setPeriod = useStandPeriod((s) => s.setPeriod);
  const setCustomRange = useStandPeriod((s) => s.setCustomRange);

  const query = useMemo(
    () => buildPeriodQuery(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const label = useMemo(() => {
    const labels: Record<string, string> = {
      day: "Today",
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
      custom: "Custom",
    };
    return labels[period] ?? "This Week";
  }, [period]);

  return {
    period,
    setPeriod,
    setCustomRange,
    label,
    query,
    startDate: query.startDate,
    endDate: query.endDate,
  };
}

/** @deprecated Layout no longer needs a provider; kept for compatibility. */
export function PeriodProvider({ children }: { children: React.ReactNode }) {
  return children;
}
