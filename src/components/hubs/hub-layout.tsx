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

interface HubLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName?: string;
  tabs: HubTab[];
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
  defaultTab,
  compact,
  children,
}: HubLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabs.some((t) => t.id === tabParam) ? tabParam! : defaultTab;

  const setTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const activeMeta = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
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
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {activeMeta && (
          <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
        )}
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4">
            {children(t.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
