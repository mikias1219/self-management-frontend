"use client";

import { BookOpen, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { hasAuthToken } from "@/lib/api/client";
import { useAnalyticsCounts } from "@/hooks/use-analytics-counts";

export function LearningProgress() {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useAnalyticsCounts();
  const c = data?.counts;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        title="Study sessions"
        value={c?.studySessions ?? "—"}
        icon={GraduationCap}
        loading={authenticated && isLoading}
      />
      <StatCard
        title="Courses"
        value={c?.courses ?? "—"}
        icon={BookOpen}
        loading={authenticated && isLoading}
      />
      <StatCard
        title="Books"
        value={c?.books ?? "—"}
        icon={BookOpen}
        loading={authenticated && isLoading}
      />
    </div>
  );
}
