"use client";

import { useEffect, useState } from "react";
import { hasAuthToken } from "@/lib/api/client";

/**
 * Auth check safe for SSR/hydration.
 * Returns `null` until mounted (server + first client paint match),
 * then the real token state.
 */
export function useHasAuthToken(): boolean | null {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthenticated(hasAuthToken());
  }, []);

  return authenticated;
}
