import { cn } from "@/lib/utils";
import type { AchievementStatus } from "@/lib/types";

const STYLES: Record<AchievementStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  ongoing: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  finished: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  achieved: "bg-amber-500/15 text-amber-800 dark:text-amber-400",
};

const LABELS: Record<AchievementStatus, string> = {
  not_started: "Not started",
  ongoing: "Ongoing",
  finished: "Finished",
  achieved: "Achieved",
};

export function AchievementStatusBadge({
  status,
  className,
}: {
  status: AchievementStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
