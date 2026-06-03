"use client";

import { Sparkles } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { spiritualApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

export function SpiritualProgress() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["spiritual"],
    () => spiritualApi.getAll(),
    { enabled: authenticated },
  );
  const list = data ?? [];

  return (
    <StatCard
      title="Spiritual activities"
      value={list.length}
      description="Logged in period"
      icon={Sparkles}
      loading={authenticated && isLoading}
    />
  );
}
