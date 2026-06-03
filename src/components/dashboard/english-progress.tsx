"use client";

import { Languages } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { englishApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function EnglishProgress() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["english"],
    () => englishApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];
  const minutes = list.reduce((s, p) => s + p.durationMinutes, 0);

  return (
    <StatCard
      title="English practice"
      value={authenticated ? `${minutes} min` : "—"}
      description={`${list.length} sessions`}
      icon={Languages}
      loading={authenticated && isLoading}
    />
  );
}
