"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasAuthToken, syncAuthCookie } from "@/lib/api/client";

/** Redirect legacy sessions (localStorage token, no cookie yet) away from login. */
export function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hasAuthToken()) return;
    syncAuthCookie();
    const from = searchParams.get("from") ?? "/";
    router.replace(from);
  }, [router, searchParams]);

  return null;
}
