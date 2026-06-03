"use client";

import type { LucideIcon } from "lucide-react";
import { useHubEmbedded } from "@/components/hubs/hub-context";
import { cn } from "@/lib/utils";

interface ModuleShellProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ModuleShell({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  actions,
}: ModuleShellProps) {
  const embedded = useHubEmbedded();

  if (embedded) {
    return (
      <div className="space-y-6">
        {actions && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 pb-4">
            {actions}
          </div>
        )}
        {children}
      </div>
    );
  }

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
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
