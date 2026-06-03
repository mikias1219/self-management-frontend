"use client";

import { Heart } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { healthApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function HealthMetrics() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["health"],
    () => healthApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];

  return (
    <StatCard
      title="Health logs"
      value={list.length}
      description="Metrics tracked"
      icon={Heart}
      loading={authenticated && isLoading}
    />
  );
}
