"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HubProvider } from "@/components/hubs/hub-context";
import { LIFE_HUB } from "@/components/hubs/configs/life-hub";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const OTHER_AREA_IDS = ["health", "spiritual", "journal"] as const;

function LifeHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab && OTHER_AREA_IDS.includes(rawTab as (typeof OTHER_AREA_IDS)[number])
      ? rawTab
      : "finance";

  const setOtherArea = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "finance") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const [visited, setVisited] = useState<string[]>(() =>
    activeTab === "finance" ? ["finance"] : ["finance", activeTab],
  );

  useEffect(() => {
    setVisited((prev) =>
      prev.includes(activeTab) ? prev : [...prev, activeTab],
    );
  }, [activeTab]);

  const { title, subtitle, icon: Icon, iconClassName, panels } = LIFE_HUB;
  const otherTabs = LIFE_HUB.tabs.filter((t) =>
    OTHER_AREA_IDS.includes(t.id as (typeof OTHER_AREA_IDS)[number]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Other areas
          </span>
          {otherTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOtherArea(isActive ? "finance" : tab.id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-full border px-3 text-xs transition-colors",
                  isActive
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {TabIcon && <TabIcon className="size-3 shrink-0" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {visited.map((tabId) => {
        const Panel = panels[tabId];
        if (!Panel) return null;
        const isActive = tabId === activeTab;
        const isFinance = tabId === "finance";

        return (
          <div key={tabId} hidden={!isActive} aria-hidden={!isActive}>
            <HubProvider>
              {isFinance ? (
                <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Finance
                  </p>
                  <Panel />
                </div>
              ) : (
                <Panel />
              )}
            </HubProvider>
          </div>
        );
      })}
    </div>
  );
}

export function LifeHubShell() {
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
      <LifeHubInner />
    </Suspense>
  );
}
