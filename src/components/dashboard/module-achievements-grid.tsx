"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bell,
  CheckSquare,
  DollarSign,
  FileText,
  Flag,
  Heart,
  Languages,
  Repeat,
  Sparkles,
  Sun,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { achievementsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";
import type { ModuleAchievementStats } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  tasks: { icon: CheckSquare, color: "bg-sky-500/15 text-sky-600" },
  goals: { icon: Flag, color: "bg-cyan-500/15 text-cyan-600" },
  habits: { icon: Repeat, color: "bg-blue-500/15 text-blue-600" },
  learning: { icon: BookOpen, color: "bg-emerald-500/15 text-emerald-600" },
  dailyReviews: { icon: Sun, color: "bg-indigo-500/15 text-indigo-600" },
  finance: { icon: DollarSign, color: "bg-amber-500/15 text-amber-700" },
  english: { icon: Languages, color: "bg-teal-500/15 text-teal-600" },
  spiritual: { icon: Sparkles, color: "bg-purple-500/15 text-purple-600" },
  health: { icon: Heart, color: "bg-rose-500/15 text-rose-600" },
  journal: { icon: FileText, color: "bg-orange-500/15 text-orange-600" },
  notifications: { icon: Bell, color: "bg-slate-500/15 text-slate-600" },
};

function ModuleAchievementCard({ mod }: { mod: ModuleAchievementStats }) {
  const cfg = MODULE_ICONS[mod.module] ?? {
    icon: CheckSquare,
    color: "bg-muted text-muted-foreground",
  };
  const Icon = cfg.icon;

  return (
    <Link href={mod.href} className="group block h-full">
      <Card className="h-full border transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                cfg.color,
              )}
            >
              <Icon className="size-4" />
            </div>
            <CardTitle className="text-sm font-semibold">{mod.label}</CardTitle>
          </div>
          <span className="text-sm font-bold tabular-nums text-primary">
            {mod.completionRate}%
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={mod.completionRate} className="h-1.5" />
          {mod.planned && mod.planned.plannedCount > 0 && (
            <p className="text-[10px] text-muted-foreground">
              Planned {mod.planned.plannedMinutes}m → Achieved{" "}
              {mod.planned.achievedMinutes}m
            </p>
          )}
          <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
            <div className="rounded-md bg-sky-500/10 py-1.5">
              <p className="font-semibold text-sky-700 dark:text-sky-400">
                {mod.ongoing}
              </p>
              <p className="text-muted-foreground">Ongoing</p>
            </div>
            <div className="rounded-md bg-emerald-500/10 py-1.5">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                {mod.finished}
              </p>
              <p className="text-muted-foreground">Finished</p>
            </div>
            <div className="rounded-md bg-amber-500/10 py-1.5">
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                {mod.achieved}
              </p>
              <p className="text-muted-foreground">Achieved</p>
            </div>
          </div>
          {mod.highlights[0] && (
            <p className="truncate text-[11px] text-muted-foreground group-hover:text-foreground">
              Latest: {mod.highlights[0].title}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function ModuleAchievementsGrid() {
  const authenticated = hasAuthToken();
  const { query } = usePeriod();

  const { data, isLoading } = useStandData(
    ["achievements", query],
    () => achievementsApi.getSnapshot(query),
    { enabled: authenticated },
  );

  if (!authenticated) return null;

  const modules = data?.modules ?? [];

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Achievement by module</h3>
        <p className="text-xs text-muted-foreground">
          Ongoing, finished, and achieved counts for the selected period — tap a
          card to manage.
        </p>
      </div>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <ModuleAchievementCard key={mod.module} mod={mod} />
          ))}
        </div>
      )}
    </section>
  );
}
