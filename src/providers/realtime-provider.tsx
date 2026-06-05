"use client";

import { useEffect } from "react";
import { hasAuthToken } from "@/lib/api/client";
import {
  disconnectRealtime,
  getRealtimeSocket,
  subscribeRealtime,
} from "@/lib/realtime/socket";
import { invalidateFromRealtime } from "@/lib/realtime/invalidate";
import { useStandUi } from "@/stores/use-stand";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const authReady = useStandUi((s) => s.authReady);

  useEffect(() => {
    if (!hasAuthToken() || !authReady) {
      disconnectRealtime();
      return;
    }
    getRealtimeSocket();
    const unsub = subscribeRealtime((payload) => invalidateFromRealtime(payload));
    return () => {
      unsub();
    };
  }, [authReady]);

  return children;
}
