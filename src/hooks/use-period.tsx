"use client";

import { useCallback, useMemo } from "react";
import {
  buildPeriodQuery,
  DEFAULT_PERIOD_SLICE,
  useStandPeriod,
} from "@/stores/use-stand";

const PERIOD_LABELS: Record<string, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
  custom: "Custom",
};

/** Period filter scoped per module — changing Finance period does not affect Analytics. */
export function usePeriod(moduleId = "default") {
  const slice = useStandPeriod(
    (s) => s.modules[moduleId] ?? DEFAULT_PERIOD_SLICE,
  );
  const setPeriodStore = useStandPeriod((s) => s.setPeriod);
  const setCustomRangeStore = useStandPeriod((s) => s.setCustomRange);

  const setPeriod = useCallback(
    (period: typeof slice.period) => setPeriodStore(moduleId, period),
    [moduleId, setPeriodStore],
  );
  const setCustomRange = useCallback(
    (start: Date, end: Date) => setCustomRangeStore(moduleId, start, end),
    [moduleId, setCustomRangeStore],
  );

  const query = useMemo(
    () => buildPeriodQuery(slice.period, slice.customStart, slice.customEnd),
    [slice.period, slice.customStart, slice.customEnd],
  );

  const label = PERIOD_LABELS[slice.period] ?? "This Week";

  return {
    moduleId,
    period: slice.period,
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
