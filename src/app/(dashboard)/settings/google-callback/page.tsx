"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";

function GoogleCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Connecting Google Calendar…");
  const [blocked, setBlocked] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDesc = params.get("error_description") ?? "";

    if (error === "access_denied" || errorDesc.includes("access_denied")) {
      handled.current = true;
      setBlocked(true);
      setMessage(
        "Google blocked sign-in — your email must be added as a test user.",
      );
      toast.error("Add your Gmail as a test user in Google Cloud Console", {
        duration: 12000,
      });
      return;
    }

    if (error) {
      handled.current = true;
      setMessage("Google connection cancelled.");
      toast.error("Calendar connection cancelled");
      setTimeout(() => router.replace("/settings"), 2000);
      return;
    }

    if (!code || !state) {
      handled.current = true;
      setMessage("Missing authorization data.");
      setTimeout(() => router.replace("/settings"), 2000);
      return;
    }

    handled.current = true;

    void integrationsApi.googleCalendar
      .connect(code, state)
      .then((res) => {
        toast.success(
          res.email
            ? `Connected ${res.email} — manage sync in Settings`
            : "Google Calendar connected — see Settings",
        );
        router.replace("/settings");
      })
      .catch((err: { response?: { data?: { message?: string | string[] } } }) => {
        const raw = err?.response?.data?.message;
        const msg = Array.isArray(raw) ? raw.join(", ") : raw;
        setMessage(msg ?? "Connection failed. Try Connect Google again.");
        toast.error(msg ?? "Could not connect Google Calendar", { duration: 8000 });
        setTimeout(() => router.replace("/settings"), 4000);
      });
  }, [params, router]);

  if (blocked) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 px-4 text-sm">
        <h2 className="text-lg font-semibold">Fix Google “Access blocked”</h2>
        <p className="text-muted-foreground">
          Your OAuth app is in <strong>Testing</strong> mode (app name may show
          as “test”). Only emails you approve can connect.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            Open{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              OAuth consent screen
            </a>{" "}
            (same Google Cloud project as your Client ID).
          </li>
          <li>
            Under <strong>Test users</strong> → <strong>Add users</strong>
          </li>
          <li>
            Add exactly:{" "}
            <code className="rounded bg-muted px-1">mikiyasabate003@gmail.com</code>
          </li>
          <li>Save, wait ~1 minute, then try Connect Google again</li>
          <li>
            Sign in with that same Gmail when Google asks (not another account)
          </li>
        </ol>
        <div className="flex gap-2 pt-2">
          <Link href="/settings">
            <Button type="button">Back to Settings</Button>
          </Link>
          <a
            href="https://console.cloud.google.com/apis/credentials/consent"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="button" variant="outline">
              Open consent screen
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p>{message}</p>
    </div>
  );
}

export default function GoogleCalendarCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
