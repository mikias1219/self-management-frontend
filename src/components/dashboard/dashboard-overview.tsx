import { AchievementHero } from "@/components/dashboard/achievement-hero";
import { ModuleAchievementsGrid } from "@/components/dashboard/module-achievements-grid";
import { AchievementReports } from "@/components/dashboard/achievement-reports";
import { HubOverview } from "@/components/dashboard/hub-overview";
import { TodayOverview } from "@/components/dashboard/today-overview";
import { WeeklyOverview } from "@/components/dashboard/weekly-overview";
import { LifeScore } from "@/components/dashboard/life-score";
import { HabitConsistency } from "@/components/dashboard/habit-consistency";
import { LearningProgress } from "@/components/dashboard/learning-progress";
import { FinancialSnapshot } from "@/components/dashboard/financial-snapshot";
import { EnglishProgress } from "@/components/dashboard/english-progress";
import { SpiritualProgress } from "@/components/dashboard/spiritual-progress";
import { HealthMetrics } from "@/components/dashboard/health-metrics";
import { AnalyticsSummary } from "@/components/dashboard/analytics-summary";
import { RecentActivities } from "@/components/dashboard/recent-activities";

/** Results and summaries — use Manage tabs for full CRUD. */
export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <HubOverview />

      <AchievementHero />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          By module
        </h3>
        <ModuleAchievementsGrid />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Planned vs achieved
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AchievementReports />
          </div>
          <div className="space-y-4">
            <LifeScore />
            <TodayOverview />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Productivity
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <WeeklyOverview />
            <HabitConsistency />
          </div>
          <RecentActivities />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Growth
        </h3>
        <LearningProgress />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Life
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FinancialSnapshot />
          <EnglishProgress />
          <SpiritualProgress />
          <HealthMetrics />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Insights
        </h3>
        <AnalyticsSummary />
      </section>
    </div>
  );
}
