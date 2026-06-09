"use client";

import { PiggyBank, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/utils/period";
import { cn } from "@/lib/utils";

interface MonthlySalaryPlanCardProps {
  netSalary: number;
  fixedObligations: number;
  savingsTarget: number;
  spendingBudget: number;
  totalVariableSpent?: number;
  currency?: string;
  cycleLabel?: string;
  className?: string;
}

export function MonthlySalaryPlanCard({
  netSalary,
  fixedObligations,
  savingsTarget,
  spendingBudget,
  totalVariableSpent = 0,
  currency = "ETB",
  cycleLabel,
  className,
}: MonthlySalaryPlanCardProps) {
  if (netSalary <= 0) return null;

  const variableRemaining = Math.max(0, spendingBudget - totalVariableSpent);
  const variablePct =
    spendingBudget > 0
      ? Math.min(100, (totalVariableSpent / spendingBudget) * 100)
      : 0;

  const rows = [
    {
      label: "Fixed bills",
      amount: fixedObligations,
      pct: (fixedObligations / netSalary) * 100,
      color: "bg-rose-500",
      icon: Receipt,
    },
    {
      label: "Savings",
      amount: savingsTarget,
      pct: (savingsTarget / netSalary) * 100,
      color: "bg-emerald-500",
      icon: PiggyBank,
    },
    {
      label: "Variable spending",
      amount: spendingBudget,
      pct: (spendingBudget / netSalary) * 100,
      color: "bg-sky-500",
      icon: Wallet,
    },
  ];

  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-4", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your monthly salary plan
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatMoney(netSalary, currency)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              net / month
            </span>
          </p>
        </div>
        {cycleLabel && (
          <p className="text-xs text-muted-foreground">{cycleLabel}</p>
        )}
      </div>

      <div className="flex h-2.5 overflow-hidden rounded-full">
        {rows.map((r) => (
          <div
            key={r.label}
            className={cn(r.color, "transition-all")}
            style={{ width: `${r.pct}%` }}
            title={`${r.label} ${Math.round(r.pct)}%`}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="size-3.5" />
                <span className="text-xs font-medium">{r.label}</span>
              </div>
              <p className="text-lg font-semibold tabular-nums">
                {formatMoney(r.amount, currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {Math.round(r.pct)}% of salary
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="size-3.5" />
            Variable expenses this cycle
          </span>
          <span className="tabular-nums font-medium">
            {formatMoney(totalVariableSpent, currency)} /{" "}
            {formatMoney(spendingBudget, currency)}
          </span>
        </div>
        <Progress value={variablePct} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {formatMoney(variableRemaining, currency)} left for food, transport,
          and other monthly costs
        </p>
      </div>
    </div>
  );
}
