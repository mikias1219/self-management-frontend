"use client";

import { Bell, LogOut, Settings as SettingsIcon, User, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ModuleSearch } from "@/components/layout/module-search";
import { authApi, notificationsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData } from "@/hooks/use-stand-data";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const authenticated = hasAuthToken();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const { data: user } = useStandData(
    ["auth", "me"],
    () => authApi.me(),
    { enabled: authenticated, staleTime: 120_000 },
  );

  const { data: unreadCount = 0 } = useStandData(
    ["notifications", "unread-count"],
    () => notificationsApi.getUnreadCount(),
    {
      enabled: authenticated && notificationsEnabled,
      staleTime: 60_000,
    },
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
      {title && (
        <h1 className="hidden text-sm font-semibold tracking-tight sm:block">
          {title}
        </h1>
      )}
      <div className="flex flex-1 justify-center px-2">
        <div className="w-full max-w-sm">
          <ModuleSearch />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative"
        onClick={() => router.push("/notifications")}
        onMouseEnter={() => setNotificationsEnabled(true)}
        onFocus={() => setNotificationsEnabled(true)}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[9px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Avatar className="size-7">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="text-xs">
                  {user?.displayName?.[0]?.toUpperCase() ?? (
                    <User className="size-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          {user && (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2">
                <Avatar className="size-9">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                  <AvatarFallback className="text-sm">
                    {user.displayName?.[0]?.toUpperCase() ?? (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <UserRound className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <SettingsIcon className="size-4" />
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
