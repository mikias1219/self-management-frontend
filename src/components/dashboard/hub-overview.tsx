"use client";

import Link from "next/link";
import {
  GraduationCap,
  HeartHandshake,
  LineChart,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HUBS = [
  {
    title: "Productivity",
    href: "/productivity",
    icon: ListChecks,
    color: "bg-sky-500/15 text-sky-600",
    summary: "Plans & tasks, goals, habits, daily reviews",
    manageLabel: "Manage productivity",
  },
  {
    title: "Growth",
    href: "/growth",
    icon: GraduationCap,
    color: "bg-emerald-500/15 text-emerald-600",
    summary: "Learning paths and English practice",
    manageLabel: "Manage growth",
  },
  {
    title: "Life",
    href: "/life",
    icon: HeartHandshake,
    color: "bg-amber-500/15 text-amber-700",
    summary: "Finance, spiritual, health, journal",
    manageLabel: "Manage life areas",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: LineChart,
    color: "bg-fuchsia-500/15 text-fuchsia-600",
    summary: "Analytics charts and activity timeline",
    manageLabel: "View insights",
  },
] as const;

export function HubOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {HUBS.map((hub) => {
        const Icon = hub.icon;
        return (
          <Link
            key={hub.href}
            href={hub.href}
            className="group block h-full"
          >
            <Card className="h-full border transition-all hover:border-primary/30 hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    hub.color,
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <CardTitle className="text-sm font-semibold">{hub.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {hub.summary}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  {hub.manageLabel}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
