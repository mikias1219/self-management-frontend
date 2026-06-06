"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface HubTab {
  id: string;
  label: string;
  description: string;
  icon?: LucideIcon;
  /** Renders as a larger primary tab (e.g. Today). */
  primary?: boolean;
}

/** Optional visual grouping for hubs with many tabs (e.g. Focus vs Manage). */
export interface HubTabGroup {
  label: string;
  tabIds: string[];
}

interface HubLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName?: string;
  tabs: HubTab[];
  /** When set, tabs render in labeled rows instead of one flat list. */
  tabGroups?: HubTabGroup[];
  defaultTab: string;
  /** Hide hub hero when nested inside dashboard manage tabs */
  compact?: boolean;
  children: (activeTab: string) => React.ReactNode;
}

function tabTriggerClass(tab: HubTab, active: boolean) {
  if (tab.primary) {
    return cn(
      "text-sm font-semibold px-4 py-2",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-primary/10 text-primary hover:bg-primary/15",
    );
  }
  return "text-xs sm:text-sm";
}

export function HubLayout({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  tabs,
  tabGroups,
  defaultTab,
  compact,
  children,
}: HubLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? searchParams.get("view");
  const TAB_ALIASES: Record<string, string> = {
    schedule: "today",
    track: "tasks",
    plans: "tasks",
    overview: "progress",
    reviews: "review",
  };
  const resolved = rawTab ? (TAB_ALIASES[rawTab] ?? rawTab) : null;
  const activeTab =
    resolved && tabs.some((t) => t.id === resolved) ? resolved : defaultTab;

  const setTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      params.delete("view");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const activeMeta = tabs.find((t) => t.id === activeTab);

  const renderTab = (t: HubTab) => {
    const TabIcon = t.icon;
    return (
      <TabsTrigger
        key={t.id}
        value={t.id}
        className={tabTriggerClass(t, activeTab === t.id)}
      >
        {TabIcon && <TabIcon className="mr-1.5 size-3.5 shrink-0" />}
        {t.label}
      </TabsTrigger>
    );
  };

  return (
    <div className={cn("space-y-6", compact && "space-y-4")}>
      {!compact && (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              iconClassName ?? "bg-primary/15 text-primary",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setTab}>
        {tabGroups?.length ? (
          <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/20 p-3">
            {tabGroups.map((group) => {
              const groupTabs = tabs.filter((t) =>
                group.tabIds.includes(t.id),
              );
              if (groupTabs.length === 0) return null;
              const isManageGroup =
                group.label.toLowerCase() === "manage" ||
                group.label.toLowerCase() === "lifestyle";
              return (
                <div key={group.label} className="space-y-2">
                  <p className="border-b border-border/60 px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  {isManageGroup ? (
                    <>
                      <TabsList className="hidden h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0 sm:flex">
                        {groupTabs.map(renderTab)}
                      </TabsList>
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="outline" size="sm" className="w-full justify-between">
                                {groupTabs.find((t) => t.id === activeTab)?.label ??
                                  `Manage (${groupTabs.length})`}
                                <ChevronDown className="size-4 opacity-60" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent className="w-[var(--anchor-width)]">
                            {groupTabs.map((t) => (
                              <DropdownMenuItem
                                key={t.id}
                                onClick={() => setTab(t.id)}
                              >
                                {t.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  ) : (
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                      {groupTabs.map(renderTab)}
                    </TabsList>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {tabs.map(renderTab)}
          </TabsList>
        )}
        {activeMeta?.description ? (
          <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
        ) : null}
        <div className={cn("mt-4", compact && "mt-3")}>
          {children(activeTab)}
        </div>
      </Tabs>
    </div>
  );
}
