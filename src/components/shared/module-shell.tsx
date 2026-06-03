"use client";

import type { LucideIcon } from "lucide-react";
import { PeriodFilter } from "@/components/shared/period-filter";
import { cn } from "@/lib/utils";

interface ModuleShellProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  showPeriod?: boolean;
}

export function ModuleShell({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  actions,
  showPeriod = true,
}: ModuleShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                iconClassName ?? "bg-primary/10 text-primary",
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showPeriod && <PeriodFilter className="lg:flex-wrap" />}
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
