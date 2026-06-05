"use client";

import type { LucideIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface HubTab {
  id: string;
  label: string;
  description: string;
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
              return (
                <div key={group.label} className="space-y-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                    {groupTabs.map((t) => (
                      <TabsTrigger
                        key={t.id}
                        value={t.id}
                        className="text-xs sm:text-sm"
                      >
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              );
            })}
          </div>
        ) : (
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {activeMeta?.description ? (
          <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
        ) : null}
        {tabs.map((t) => (
          <TabsContent
            key={t.id}
            value={t.id}
            className={cn("mt-4", compact && "mt-3")}
          >
            {children(t.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
