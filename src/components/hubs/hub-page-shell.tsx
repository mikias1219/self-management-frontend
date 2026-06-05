"use client";

import { Suspense } from "react";
import { HubProvider } from "@/components/hubs/hub-context";
import {
  HubLayout,
  type HubTab,
  type HubTabGroup,
} from "@/components/hubs/hub-layout";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface HubPageShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName?: string;
  tabs: HubTab[];
  tabGroups?: HubTabGroup[];
  defaultTab: string;
  panels: Record<string, React.ComponentType>;
  /** Nested in dashboard — tabs only, no duplicate hub header */
  compact?: boolean;
}

function HubPageInner({
  title,
  subtitle,
  icon,
  iconClassName,
  tabs,
  tabGroups,
  defaultTab,
  panels,
  compact,
}: HubPageShellProps) {
  const Panel = (tab: string) => {
    const C = panels[tab];
    if (!C) return null;
    return (
      <HubProvider>
        <C />
      </HubProvider>
    );
  };

  return (
    <HubLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconClassName={iconClassName}
      tabs={tabs}
      tabGroups={tabGroups}
      defaultTab={defaultTab}
      compact={compact}
    >
      {(tab) => Panel(tab)}
    </HubLayout>
  );
}

export function HubPageShell(props: HubPageShellProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-full max-w-lg" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <HubPageInner {...props} />
    </Suspense>
  );
}
