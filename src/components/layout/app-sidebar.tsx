"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Hexagon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStandData } from "@/hooks/use-stand-data";
import { authApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { NAV_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";

function profileInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppSidebar() {
  const pathname = usePathname();
  const collapsed = useStandUi((s) => s.sidebarCollapsed);
  const toggleSidebar = useStandUi((s) => s.toggleSidebar);
  const authenticated = hasAuthToken();

  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authenticated,
    staleTime: 120_000,
  });

  const todayLabel = format(new Date(), "EEE, d MMM");

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 shrink-0 flex-col border-r bg-gradient-to-b from-sidebar via-sidebar to-sidebar/80 transition-[width] duration-200 md:flex",
        collapsed ? "w-14" : "w-[200px]",
      )}
    >
      <div className="flex shrink-0 flex-col border-b border-sidebar-border/60 px-2.5 py-2.5">
        <div className="flex h-9 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
            <Hexagon className="size-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold tracking-tight">
                LifeOS
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Personal OS
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleSidebar}
            className="ml-auto shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </Button>
        </div>
        {!collapsed && (
          <p className="mt-1.5 px-0.5 text-[11px] text-muted-foreground">
            {todayLabel}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-2">
        <nav className="px-1.5 pb-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              const showSeparator = false;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent shadow-sm ring-1 ring-sidebar-border/50"
                        : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                        item.color,
                        active && "ring-2 ring-primary/25",
                        item.highlight && !active && "ring-1 ring-primary/40",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    {!collapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                  {showSeparator && (
                    <Separator className="my-1.5 bg-sidebar-border/60" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <Separator className="shrink-0" />
      <div className={cn("shrink-0 p-1.5", collapsed && "px-1")}>
        <Link
          href="/profile"
          title={collapsed ? "Profile" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-sidebar-accent/40",
            collapsed && "justify-center px-0",
            pathname.startsWith("/profile") &&
              "bg-sidebar-accent ring-1 ring-sidebar-border/50",
          )}
        >
          <Avatar className="size-7 shrink-0">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-[10px]">
              {profileInitials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.displayName ?? "Profile"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Profile
              </p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
