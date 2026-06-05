"use client";

import { useLayoutEffect } from "react";
import { syncAuthCookie } from "@/lib/api/client";

/** Sync localStorage JWT → cookie on every load (handles legacy sessions). */
export function AuthSync() {
  useLayoutEffect(() => {
    syncAuthCookie();
  }, []);
  return null;
}
