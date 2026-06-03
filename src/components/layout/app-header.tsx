"use client";

import { Bell, LogOut, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { authApi, notificationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { PeriodFilter } from "@/components/shared/period-filter";
import { useStandData } from "@/hooks/use-stand-data";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const authenticated = hasAuthToken();

  const { data: user } = useStandData(
    ["auth", "me"],
    () => authApi.me(),
    { enabled: authenticated },
  );

  const { data: notifications } = useStandData(
    ["notifications"],
    () => notificationsApi.getAll(),
    { enabled: authenticated },
  );

  const unread = (notifications ?? []).filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
      {title && (
        <h1 className="hidden text-sm font-semibold tracking-tight sm:block">
          {title}
        </h1>
      )}
      <div className="relative ml-auto flex flex-1 items-center gap-3 sm:max-w-md">
        <Search className="absolute left-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          className="h-8 bg-muted/40 pl-8 text-sm"
        />
      </div>
      <PeriodFilter className="hidden lg:flex" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        onClick={() => router.push("/notifications")}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[9px]">
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">
                  {user?.displayName?.[0]?.toUpperCase() ?? (
                    <User className="size-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          {user && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authApi.logout();
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
