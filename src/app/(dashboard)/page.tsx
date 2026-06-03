import { PeriodFilter } from "@/components/shared/period-filter";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { WeeklyOverview } from "@/components/dashboard/weekly-overview";
import { LifeScore } from "@/components/dashboard/life-score";
import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { HabitConsistency } from "@/components/dashboard/habit-consistency";
import { LearningProgress } from "@/components/dashboard/learning-progress";
import { FinancialSnapshot } from "@/components/dashboard/financial-snapshot";
import { EnglishProgress } from "@/components/dashboard/english-progress";
import { SpiritualProgress } from "@/components/dashboard/spiritual-progress";
import { HealthMetrics } from "@/components/dashboard/health-metrics";
import { AnalyticsSummary } from "@/components/dashboard/analytics-summary";
import { RecentActivities } from "@/components/dashboard/recent-activities";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Your life at a glance — tasks, habits, goals, and more.
          </p>
        </div>
        <PeriodFilter className="lg:hidden" />
      </div>

      <TodayOverview />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <WeeklyOverview />
          <HabitConsistency />
          <AnalyticsSummary />
        </div>
        <div className="space-y-4">
          <LifeScore />
          <GoalsWidget />
          <RecentActivities />
        </div>
      </div>

      <LearningProgress />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialSnapshot />
        <EnglishProgress />
        <SpiritualProgress />
        <HealthMetrics />
      </div>
    </div>
  );
}
