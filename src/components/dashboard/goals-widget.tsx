"use client";

import { ProgressWidget } from "@/components/shared/progress-widget";
import { goalsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function GoalsWidget() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["goals"],
    () => goalsApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];

  const items = list.slice(0, 5).map((g) => ({
    label: g.title,
    value: Math.round(g.progress),
    max: 100,
  }));

  return (
    <ProgressWidget
      title="Goals progress"
      items={items.length ? items : [{ label: "No goals yet", value: 0 }]}
      loading={authenticated && isLoading}
    />
  );
}
