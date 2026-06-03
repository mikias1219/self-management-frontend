"use client";

import { BarChart3 } from "lucide-react";
import { ModuleShell } from "@/components/shared/module-shell";
import { MetricChart } from "@/components/shared/metric-chart";
import { StatCard } from "@/components/shared/stat-card";
import {
  analyticsToChartData,
  useFinanceRelations,
} from "@/hooks/use-module-relations";
import { analyticsApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import {
  CHART_PALETTE,
  colorForModuleKey,
  MODULE_LABELS,
} from "@/lib/constants/chart-colors";
import { usePeriod } from "@/hooks/use-period";
import { useStandData } from "@/hooks/use-stand-data";
import type { ModuleCounts } from "@/lib/types";
import { formatMoney } from "@/lib/utils/period";

const PRODUCTIVITY_KEYS = ["tasks", "goals", "habitLogs", "dailyReviews"] as const;
const GROWTH_KEYS = ["studySessions", "courses", "books", "englishPractices"] as const;
const LIFE_KEYS = [
  "transactions",
  "healthLogs",
  "spiritualActivities",
  "journalEntries",
] as const;

function sliceCounts(
  counts: ModuleCounts,
  keys: readonly (keyof ModuleCounts)[],
) {
  return keys
    .map((key) => ({
      name: MODULE_LABELS[key] ?? key,
      value: counts[key] ?? 0,
      moduleKey: key,
    }))
    .filter((d) => d.value > 0);
}

export default function AnalyticsPage() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const { summary: financeSummary } = useFinanceRelations();

  const { data, isLoading } = useStandData(
    ["analytics", "counts", query],
    () => analyticsApi.getCounts(query),
    { enabled: authenticated },
  );

  const c = data?.counts;
  const total = c ? Object.values(c).reduce((a, b) => a + b, 0) : 0;
  const allChart = c ? analyticsToChartData(c) : [];
  const productivity = c ? sliceCounts(c, PRODUCTIVITY_KEYS) : [];
  const growth = c ? sliceCounts(c, GROWTH_KEYS) : [];
  const life = c ? sliceCounts(c, LIFE_KEYS) : [];

  const financeChart = financeSummary
    ? [
        {
          name: "Income",
          value: financeSummary.totals.totalIncome,
          color: "#22c55e",
        },
        {
          name: "Expense",
          value: financeSummary.totals.totalExpense,
          color: "#ef4444",
        },
        {
          name: "Net",
          value: Math.max(0, financeSummary.totals.netCashFlow),
          color: "#0ea5e9",
        },
      ].filter((d) => d.value > 0)
    : [];

  if (!authenticated) {
    return (
      <ModuleShell
        title="Analytics"
        icon={BarChart3}
        iconClassName="bg-fuchsia-500/15 text-fuchsia-600"
        showPeriod={false}
      >
        <p className="py-12 text-center text-sm text-muted-foreground">
          Sign in to view analytics.
        </p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Analytics"
      description={`Cross-module insights & colorful breakdown — ${label}`}
      icon={BarChart3}
      iconClassName="bg-fuchsia-500/15 text-fuchsia-600"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total activities" value={total} loading={isLoading} />
        <StatCard
          title="Net worth"
          value={formatMoney(financeSummary?.totals.netWorth ?? 0)}
          loading={isLoading}
        />
        <StatCard
          title="Savings rate"
          value={`${financeSummary?.totals.savingsRate ?? 0}%`}
          loading={isLoading}
        />
        <StatCard
          title="Active domains"
          value={allChart.length}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricChart
          title="All modules (pie)"
          data={allChart}
          type="pie"
          loading={isLoading}
          height={280}
          multiColor
        />
        <MetricChart
          title="Full breakdown (bars)"
          data={allChart}
          type="bar"
          loading={isLoading}
          height={280}
          multiColor
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricChart
          title="Productivity"
          data={productivity}
          type="bar"
          loading={isLoading}
          height={220}
          color={colorForModuleKey("tasks")}
          multiColor
        />
        <MetricChart
          title="Growth"
          data={growth}
          type="bar"
          loading={isLoading}
          height={220}
          color={colorForModuleKey("studySessions")}
          multiColor
        />
        <MetricChart
          title="Life"
          data={life}
          type="bar"
          loading={isLoading}
          height={220}
          color={colorForModuleKey("healthLogs")}
          multiColor
        />
      </div>

      {financeChart.length > 0 && (
        <MetricChart
          title="Finance flow (period)"
          data={financeChart}
          type="bar"
          loading={isLoading}
          height={220}
          multiColor
        />
      )}

      {financeSummary && financeSummary.expenseByCategory.length > 0 && (
        <MetricChart
          title="Expenses by category"
          data={financeSummary.expenseByCategory.map((c, i) => ({
            name: c.name,
            value: c.amount,
            color: CHART_PALETTE[i % CHART_PALETTE.length],
          }))}
          type="pie"
          height={260}
          multiColor
        />
      )}
    </ModuleShell>
  );
}
