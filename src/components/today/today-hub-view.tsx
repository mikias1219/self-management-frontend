"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { TodayView } from "@/components/productivity/today-view";
import { DailyFocusCard } from "@/components/shared/daily-focus-card";
import { HabitsTodaySection } from "@/components/shared/habits-today-section";
import { BillsDueSoon } from "@/components/shared/bills-due-soon";
import { AIInsightCard } from "@/components/shared/ai-insight-card";
import { EveningReview } from "@/components/today/evening-review";
import { WeeklyReviewPrompt } from "@/components/today/weekly-review-prompt";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi, dashboardApi, productivityApi } from "@/lib/api";
import { useHasAuthToken } from "@/hooks/use-has-auth-token";
import { useStandData } from "@/hooks/use-stand-data";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function TodayHubView() {
  const authenticated = useHasAuthToken();
  const authReady = authenticated === true;
  const openAiChat = useStandUi((s) => s.openAiChat);

  const { data: overview } = useStandData(
    ["dashboard", "pos"],
    () => dashboardApi.getOverview(),
    { enabled: authReady, staleTime: 30_000 },
  );
  const { data: user } = useStandData(["auth", "me"], () => authApi.me(), {
    enabled: authReady,
  });
  const { data: todaySummary, isLoading } = useStandData(
    ["productivity", "today-summary"],
    () => productivityApi.getTodaySummary(),
    { enabled: authReady, staleTime: 60_000 },
  );

  const aiInsight = overview?.aiInsight;
  const insightText =
    typeof aiInsight === "string" ? aiInsight : aiInsight?.text ?? "";
  const insightHref =
    typeof aiInsight === "object" && aiInsight?.actionHref
      ? aiInsight.actionHref
      : "/productivity?tab=tasks";

  if (!authReady) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Sign in to see your day.
      </div>
    );
  }

  if (isLoading && !todaySummary) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const tasks = todaySummary?.tasks ?? [];
  const habits = todaySummary?.habits ?? [];
  const obligations = todaySummary?.obligations ?? [];
  const habitsLogged = habits.filter((h) => h.logged).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {user?.firstName ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
      </div>

      <AIInsightCard moduleKey="tasks" />

      {insightText && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
              <p className="text-sm">{insightText}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={insightHref}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Take action
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openAiChat("What should I focus on today?")}
              >
                <Bot className="size-3.5" />
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <WeeklyReviewPrompt />

      <DailyFocusCard tasks={tasks} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HabitsTodaySection habits={habits} />
        <BillsDueSoon bills={obligations} />
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Schedule</h2>
        <TodayView />
      </div>

      <EveningReview
        reviewExists={todaySummary?.reviewExists ?? false}
        stats={{
          tasksDone: tasks.filter((t) => t.taskStatus === "done").length,
          habitsLogged,
        }}
      />
    </div>
  );
}
