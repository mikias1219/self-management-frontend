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

function secondaryTabClass(active: boolean) {
  return cn(
    "h-7 rounded-full px-3 text-xs font-normal",
    active
      ? "bg-muted text-foreground shadow-none"
      : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );
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
  const primaryTab = tabs.find((t) => t.primary);
  const secondaryTabs = primaryTab
    ? tabs.filter((t) => !t.primary)
    : tabs;

  const renderSecondaryTab = (t: HubTab) => {
    const TabIcon = t.icon;
    return (
      <TabsTrigger
        key={t.id}
        value={t.id}
        id={`hub-tab-${t.id}`}
        aria-controls={`hub-panel-${t.id}`}
        className={secondaryTabClass(activeTab === t.id)}
      >
        {TabIcon && <TabIcon className="mr-1 size-3 shrink-0" />}
        {t.label}
      </TabsTrigger>
    );
  };

  const renderFlatTabs = () => (
    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
      {tabs.map(renderSecondaryTab)}
    </TabsList>
  );

  const renderPrimaryLayout = () => {
    if (!primaryTab) return renderFlatTabs();

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeTab === primaryTab.id ? "default" : "secondary"}
          className={cn(
            "h-8 rounded-full px-4 font-semibold",
            activeTab !== primaryTab.id && "bg-primary/10 text-primary hover:bg-primary/15",
          )}
          onClick={() => setTab(primaryTab.id)}
        >
          {primaryTab.label}
        </Button>
        <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <TabsList className="flex h-auto flex-wrap justify-start gap-0.5 bg-transparent p-0">
          {secondaryTabs.map(renderSecondaryTab)}
        </TabsList>
      </div>
    );
  };

  const renderGroupedTabs = () => {
    if (!tabGroups?.length) return renderPrimaryLayout();

    const primaryGroup = tabGroups.find((g) =>
      g.tabIds.some((id) => tabs.find((t) => t.id === id)?.primary),
    );
    const primaryFromGroup = primaryGroup
      ? tabs.find(
          (t) => t.primary && primaryGroup.tabIds.includes(t.id),
        )
      : primaryTab;

    const secondaryFromGroups = tabGroups.flatMap((group) =>
      tabs.filter(
        (t) => group.tabIds.includes(t.id) && t.id !== primaryFromGroup?.id,
      ),
    );

    const uniqueSecondary = secondaryFromGroups.filter(
      (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i,
    );

    if (!primaryFromGroup) {
      return (
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0.5 bg-transparent p-0">
          {uniqueSecondary.map(renderSecondaryTab)}
        </TabsList>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeTab === primaryFromGroup.id ? "default" : "secondary"}
          className={cn(
            "h-8 rounded-full px-4 font-semibold",
            activeTab !== primaryFromGroup.id &&
              "bg-primary/10 text-primary hover:bg-primary/15",
          )}
          onClick={() => setTab(primaryFromGroup.id)}
        >
          {primaryFromGroup.label}
        </Button>
        <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <TabsList className="flex h-auto flex-wrap justify-start gap-0.5 bg-transparent p-0">
          {uniqueSecondary.map(renderSecondaryTab)}
        </TabsList>
        <div className="w-full sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="w-full justify-between">
                  {tabs.find((t) => t.id === activeTab)?.label ?? "More tabs"}
                  <ChevronDown className="size-4 opacity-60" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-[var(--anchor-width)]">
              {uniqueSecondary.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setTab(t.id)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
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
        {renderGroupedTabs()}
        {activeMeta?.description ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {activeMeta.description}
          </p>
        ) : null}
        <div className={cn("mt-4", compact && "mt-3")}>
          {children(activeTab)}
        </div>
      </Tabs>
    </div>
  );
}
