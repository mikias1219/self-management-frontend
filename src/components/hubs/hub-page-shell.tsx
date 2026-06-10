"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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
  compact?: boolean;
}

/** Keep visited hub panels mounted (hidden) to avoid remount cost on tab return. */
function HubVisitedPanels({
  activeTab,
  panels,
}: {
  activeTab: string;
  panels: Record<string, React.ComponentType>;
}) {
  const [visited, setVisited] = useState<string[]>([activeTab]);

  useEffect(() => {
    setVisited((prev) =>
      prev.includes(activeTab) ? prev : [...prev, activeTab],
    );
  }, [activeTab]);

  return (
    <>
      {visited.map((tabId) => {
        const Panel = panels[tabId];
        if (!Panel) return null;
        const isActive = tabId === activeTab;
        return (
          <div
            key={tabId}
            role="tabpanel"
            id={`hub-panel-${tabId}`}
            aria-labelledby={`hub-tab-${tabId}`}
            hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
          >
            <HubProvider>
              <Panel />
            </HubProvider>
          </div>
        );
      })}
    </>
  );
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
  const renderPanels = useCallback(
    (activeTab: string) => (
      <HubVisitedPanels activeTab={activeTab} panels={panels} />
    ),
    [panels],
  );

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
      {renderPanels}
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
