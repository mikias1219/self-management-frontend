"use client";

import { AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import type { FinanceSummary } from "@/lib/types/finance";
import type { FinanceCycle } from "@/lib/types/finance";

interface FinancePastViewProps {
  summary: FinanceSummary | undefined;
  pastCycles: FinanceCycle[];
  currency: string;
  onCycleClick: (id: string) => void;
}

export function FinancePastView({
  summary,
  pastCycles,
  currency,
  onCycleClick,
}: FinancePastViewProps) {
  const wastage = summary?.totals.totalWastage ?? 0;

  return (
    <div className="mt-4 space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="size-4 text-destructive" />
            Wastage report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums text-destructive">
            {formatMoney(wastage, currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Expenses flagged as wasteful this period
          </p>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium">Closed cycles</h3>
        {pastCycles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No closed cycles yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {pastCycles.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => onCycleClick(c.id)}
                >
                  <span>
                    {c.startDate} → {c.endDate}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    Net {formatMoney(Number(c.netSalary), currency)} · Savings{" "}
                    {formatPercent(Number(c.actualSavingsRate ?? 0))} · Health{" "}
                    {c.financialHealthScore ?? 0}/100
                    {c.unspentBudget
                      ? ` · Unspent ${formatMoney(Number(c.unspentBudget), currency)}`
                      : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface FinancePresentViewProps {
  summary: FinanceSummary | undefined;
  currency: string;
}

export function FinancePresentView({ summary, currency }: FinancePresentViewProps) {
  const cycle = summary?.currentCycle;
  const todaySpend =
    summary?.dailyCashFlow.find(
      (d) => d.date === new Date().toISOString().slice(0, 10),
    )?.expense ?? 0;
  const dailyBudget =
    cycle && cycle.spendingBudget > 0
      ? cycle.spendingBudget /
        Math.max(
          1,
          Math.ceil(
            (new Date(cycle.endDate).getTime() -
              new Date(cycle.startDate).getTime()) /
              86400000,
          ) + 1,
        )
      : 0;

  return (
    <div className="mt-4 space-y-4">
      {cycle ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Cycle health</p>
                <p className="text-2xl font-semibold">
                  {cycle.financialHealthScore ?? "—"}/100
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Spent today</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatMoney(todaySpend, currency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Daily budget</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatMoney(dailyBudget, currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {(summary?.obligations.upcoming.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bills due this week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {summary!.obligations.upcoming.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between rounded border px-2 py-1.5"
                  >
                    <span>{o.name}</span>
                    <span className="text-muted-foreground">
                      {o.dueDate} · {formatMoney(o.expectedAmount, currency)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(summary?.obligations.overdue.length ?? 0) > 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 flex gap-2 text-sm">
              <AlertTriangle className="size-4 text-destructive shrink-0" />
              <p>
                {summary!.obligations.overdue.length} overdue obligation(s) — pay
                from the Obligations tab.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No open cycle. Log salary to start tracking.
        </p>
      )}
    </div>
  );
}

interface FinanceFutureViewProps {
  summary: FinanceSummary | undefined;
  currency: string;
}

export function FinanceFutureView({ summary, currency }: FinanceFutureViewProps) {
  const plan = summary?.annualPlan;

  return (
    <div className="mt-4 space-y-4">
      {plan && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Annual savings target ({plan.year})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(plan.currentProgress, currency)} /{" "}
              {formatMoney(plan.targetAmount, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {plan.progressPercent}% of annual goal
            </p>
          </CardContent>
        </Card>
      )}

      {(summary?.savingsGoals ?? []).map((g) => (
        <Card key={g.id}>
          <CardContent className="pt-4 space-y-1">
            <p className="font-medium">{g.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatMoney(g.currentAmount, currency)} of{" "}
              {formatMoney(g.targetAmount, currency)}
              {g.projectedCompletionDate &&
                ` · projected ${g.projectedCompletionDate}`}
            </p>
            {(g.savingsShortfallCarryForward ?? 0) > 0 && (
              <p className="text-xs text-amber-600">
                +{formatMoney(g.savingsShortfallCarryForward!, currency)} carry-forward
                needed
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {!plan && (summary?.savingsGoals ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">
          Set savings goals and an annual target in Settings to see projections.
        </p>
      )}
    </div>
  );
}
