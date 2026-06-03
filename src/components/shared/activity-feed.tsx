"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  items: ActivityLog[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ActivityFeed({
  items,
  loading,
  emptyMessage = "No recent activity",
  className,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <Activity className="mb-2 size-8 opacity-40" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[280px] pr-3", className)}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-lg border border-transparent px-1 py-1.5 transition-colors hover:border-border hover:bg-muted/50"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Activity className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {item.description ??
                  `${item.action} ${item.entityType}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.module} ·{" "}
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
