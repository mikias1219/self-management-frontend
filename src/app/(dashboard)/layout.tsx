"use client";

import { useLayoutEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAccentFromSettings } from "@/hooks/use-accent-from-settings";
import { hasAuthToken } from "@/lib/api/client";
import { useStandUi } from "@/stores/use-stand";

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuthReady = useStandUi((s) => s.setAuthReady);
  useAccentFromSettings();

  useLayoutEffect(() => {
    setAuthReady(hasAuthToken());
  }, [setAuthReady]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
