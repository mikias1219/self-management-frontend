"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAccentFromSettings } from "@/hooks/use-accent-from-settings";
import { hasAuthToken } from "@/lib/api/client";
import { useStandUi } from "@/stores/use-stand";
import { getRealtimeSocket } from "@/lib/realtime/socket";

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useStandUi((s) => s.authReady);
  const setAuthReady = useStandUi((s) => s.setAuthReady);
  useAccentFromSettings();

  useEffect(() => {
    if (!hasAuthToken()) {
      setAuthReady(false);
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthReady(true);
    getRealtimeSocket();
  }, [router, pathname, setAuthReady]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading LifeOS...
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
