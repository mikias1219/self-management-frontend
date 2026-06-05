"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  CheckCircle2,
  KeyRound,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { authApi, dashboardApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import type { User } from "@/lib/types";
import { formatMoney } from "@/lib/utils/period";
import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const authenticated = hasAuthToken();

  const { data: user, isLoading } = useStandData(
    ["auth", "me"],
    () => authApi.me(),
    { enabled: authenticated },
  );

  const { data: overview } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authenticated },
  );

  if (!authenticated) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        Sign in to manage your profile.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your identity, focus areas, and a snapshot of how your LifeOS is
          trending.
        </p>
      </div>

      <ProfileHeader user={user} loading={isLoading} />

      <LifeStats overview={overview} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <IdentityForm user={user} loading={isLoading} />
        <AboutForm user={user} loading={isLoading} />
      </div>

      <PasswordForm />
      <ResetPasswordForm />
    </div>
  );
}

function ProfileHeader({
  user,
  loading,
}: {
  user?: User;
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      <CardContent className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <Avatar className="size-20 ring-4 ring-background" size="lg">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-xl font-semibold">
              {initials(user?.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1">
            <p className="text-lg font-semibold leading-tight">
              {loading ? "…" : (user?.displayName ?? "Your name")}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.createdAt && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            )}
          </div>
        </div>
        {user?.focusAreas?.length ? (
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            {user.focusAreas.map((area) => (
              <Badge key={area} variant="secondary" className="capitalize">
                {area}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LifeStats({
  overview,
}: {
  overview?: Awaited<ReturnType<typeof dashboardApi.getOverview>>;
}) {
  const currency = overview?.financialSnapshot.currency ?? "ETB";
  const stats = [
    {
      label: "Productivity",
      value: `${overview?.scores.productivityScore ?? 0}`,
      suffix: "/100",
      icon: TrendingUp,
      tint: "text-sky-600",
      progress: overview?.scores.productivityScore ?? 0,
    },
    {
      label: "Financial health",
      value: `${overview?.scores.financialHealthScore ?? 0}`,
      suffix: "/100",
      icon: Wallet,
      tint: "text-emerald-600",
      progress: overview?.scores.financialHealthScore ?? 0,
    },
    {
      label: "Task completion",
      value: `${overview?.taskStatus.completionRate ?? 0}%`,
      icon: CheckCircle2,
      tint: "text-violet-600",
      progress: overview?.taskStatus.completionRate ?? 0,
    },
    {
      label: "Net balance",
      value: formatMoney(overview?.financialSnapshot.netBalance ?? 0, currency),
      icon: Activity,
      tint:
        (overview?.financialSnapshot.netBalance ?? 0) >= 0
          ? "text-emerald-600"
          : "text-rose-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="space-y-2 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
                <Icon className={cn("size-4", s.tint)} />
              </div>
              <p className="text-xl font-semibold tabular-nums">
                {s.value}
                {s.suffix && (
                  <span className="text-sm text-muted-foreground">
                    {s.suffix}
                  </span>
                )}
              </p>
              {s.progress !== undefined && (
                <Progress value={s.progress} className="h-1.5" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function IdentityForm({ user, loading }: { user?: User; loading: boolean }) {
  const mutation = useStandMutation(authApi.updateProfile, {
    invalidateAll: false,
    invalidateKeys: [["auth", "me"]],
    onSuccess: () => toast.success("Profile updated"),
    onError: () => toast.error("Could not update profile"),
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Identity</CardTitle>
        <CardDescription>
          Name, email, avatar, and regional preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void mutation.mutate({
                displayName: String(fd.get("displayName") ?? "").trim(),
                email: String(fd.get("email") ?? "").trim(),
                avatarUrl: String(fd.get("avatarUrl") ?? "").trim(),
                timezone: String(fd.get("timezone") ?? "").trim() || "UTC",
                primaryCurrency:
                  String(fd.get("primaryCurrency") ?? "").trim() || "USD",
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={user?.displayName}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                placeholder="https://…"
                defaultValue={user?.avatarUrl ?? ""}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue={user?.timezone ?? "UTC"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="primaryCurrency">Primary currency</Label>
                <Input
                  id="primaryCurrency"
                  name="primaryCurrency"
                  maxLength={8}
                  className="uppercase"
                  defaultValue={user?.primaryCurrency ?? "ETB"}
                />
              </div>
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save identity"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function AboutForm({ user, loading }: { user?: User; loading: boolean }) {
  const [areas, setAreas] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setAreas(user?.focusAreas ?? []);
  }, [user?.focusAreas]);

  const mutation = useStandMutation(authApi.updateProfile, {
    invalidateAll: false,
    invalidateKeys: [["auth", "me"]],
    onSuccess: () => toast.success("About updated"),
    onError: () => toast.error("Could not update about"),
  });

  const addArea = () => {
    const value = draft.trim().toLowerCase();
    if (!value) return;
    if (areas.includes(value)) {
      setDraft("");
      return;
    }
    if (areas.length >= 12) {
      toast.error("Up to 12 focus areas");
      return;
    }
    setAreas((prev) => [...prev, value]);
    setDraft("");
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          About & focus
        </CardTitle>
        <CardDescription>
          A short bio and the life areas you want to prioritize.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void mutation.mutate({
                about: String(fd.get("about") ?? "").trim(),
                focusAreas: areas,
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="about">About me</Label>
              <Textarea
                id="about"
                name="about"
                rows={4}
                placeholder="What are you working toward right now?"
                defaultValue={user?.about ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Target className="size-3.5" />
                Focus areas
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {areas.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No focus areas yet.
                  </span>
                )}
                {areas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="gap-1 capitalize"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() =>
                        setAreas((prev) => prev.filter((a) => a !== area))
                      }
                      aria-label={`Remove ${area}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="e.g. health, faith, career"
                />
                <Button type="button" variant="outline" onClick={addArea}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save about"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });

  const mutation = useStandMutation(authApi.changePassword, {
    invalidateAll: false,
    onSuccess: () => {
      toast.success("Password changed");
      setForm({ currentPassword: "", newPassword: "" });
    },
    onError: () => toast.error("Could not change password"),
  });

  const valid = useMemo(
    () =>
      form.currentPassword.length > 0 && form.newPassword.length >= 8,
    [form],
  );

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4" />
          Change password
        </CardTitle>
        <CardDescription>
          Enter your current password and choose a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) {
              toast.error("New password must be at least 8 characters");
              return;
            }
            void mutation.mutate(form);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, newPassword: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          </div>
          <Button type="submit" disabled={mutation.isPending || !valid}>
            {mutation.isPending ? "Updating…" : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useStandMutation(authApi.resetPassword, {
    invalidateAll: false,
    onSuccess: () => {
      toast.success("Password has been reset");
      setNewPassword("");
      setConfirm("");
    },
    onError: () => toast.error("Could not reset password"),
  });

  const valid = newPassword.length >= 8 && newPassword === confirm;

  return (
    <Card className="border shadow-sm border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-amber-700">
          <KeyRound className="size-4" />
          Forgot your current password?
        </CardTitle>
        <CardDescription>
          You can set a new password directly. This is a quick reset (no email
          verification). Stronger recovery will be added later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) {
              toast.error("Passwords must match and be at least 8 characters");
              return;
            }
            void mutation.mutate({ newPassword });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="resetNew">New password</Label>
            <Input
              id="resetNew"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resetConfirm">Confirm new password</Label>
            <Input
              id="resetConfirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending || !valid}>
            {mutation.isPending ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
