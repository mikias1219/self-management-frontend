"use client";

import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Calendar,
  Home,
  PiggyBank,
  Receipt,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  FinanceAccount,
  FinanceSummary,
  FinanceSummaryObligation,
  RecurringObligation,
} from "@/lib/types";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { cn } from "@/lib/utils";

const SALARY_AMOUNT = 16_000;

interface FinanceOverviewProps {
  summary: FinanceSummary | undefined;
  accounts: FinanceAccount[];
  recurring: RecurringObligation[];
  currency: string;
  salaryDay: number;
  loading?: boolean;
  onLogSalary: () => void;
  onLogExpense: () => void;
  onTransferSavings: () => void;
  onPayObligation: (o: FinanceSummaryObligation) => void;
  onAddRecurring: () => void;
}

function nextSalaryDate(salaryDay: number): Date {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), salaryDay);
  if (candidate > now) return candidate;
  return new Date(now.getFullYear(), now.getMonth() + 1, salaryDay);
}

export function FinanceOverview({
  summary: s,
  accounts,
  recurring,
  currency,
  salaryDay,
  loading,
  onLogSalary,
  onLogExpense,
  onTransferSavings,
  onPayObligation,
  onAddRecurring,
}: FinanceOverviewProps) {
  const salaryAccount =
    accounts.find((a) => a.name === "IE Salary") ??
    accounts.find((a) => a.accountType === "checking");
  const savingsAccount =
    accounts.find((a) => a.name === "My Saving") ??
    accounts.find((a) => a.accountType === "savings");

  const cycle = s?.currentCycle;
  const hasSalary = Boolean(cycle && Number(cycle.netSalary) > 0);
  const nextSalary = nextSalaryDate(salaryDay);
  const savingsGoal = s?.savingsGoals?.[0];

  const planRows = [
    {
      kind: "income" as const,
      label: "Salary (IE Salary)",
      amount: SALARY_AMOUNT,
      note: hasSalary ? "Received this cycle" : `Due ${format(nextSalary, "MMM d")}`,
    },
    ...recurring.map((r) => ({
      kind: "fixed" as const,
      label: r.name,
      amount: Number(r.amount),
      note: `Due day ${r.dueDayOfMonth}`,
    })),
    {
      kind: "savings" as const,
      label: "Transfer to My Saving",
      amount: savingsGoal?.monthlyTargetAmount ?? 2_000,
      note: "Monthly goal",
    },
    ...(s?.budgets ?? []).map((b) => ({
      kind: "variable" as const,
      label: b.name,
      amount: b.amount,
      note: `${formatMoney(b.spent, currency)} spent`,
      spent: b.spent,
      percentUsed: b.percentUsed,
    })),
  ];

  const committed = planRows
    .filter((r) => r.kind !== "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = SALARY_AMOUNT - committed;

  const bills = [
    ...(s?.obligations.overdue ?? []),
    ...(s?.obligations.upcoming ?? []),
  ];

  return (
    <div className="space-y-5">
      {/* Accounts */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Wallet className="size-3.5" />
            IE Salary
          </p>
          <p className="text-2xl font-semibold tabular-nums mt-1">
            {formatMoney(Number(salaryAccount?.balance ?? 0), currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Income account</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <PiggyBank className="size-3.5" />
            My Saving
          </p>
          <p className="text-2xl font-semibold tabular-nums mt-1 text-emerald-600">
            {formatMoney(Number(savingsAccount?.balance ?? 0), currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Goal {formatMoney(savingsGoal?.monthlyTargetAmount ?? 2_000, currency)}/mo
          </p>
        </div>
      </div>

      {/* Salary status */}
      {!hasSalary && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-3">
            <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Salary arrives {format(nextSalary, "EEEE, MMM d")}</p>
              <p className="text-sm text-muted-foreground">
                {formatMoney(SALARY_AMOUNT, currency)} will land in IE Salary. Log it on day{" "}
                {salaryDay} to open this month&apos;s cycle.
              </p>
            </div>
          </div>
          <Button onClick={onLogSalary}>Log salary when received</Button>
        </div>
      )}

      {hasSalary && cycle && (
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
          <span>
            <span className="font-medium">Active cycle</span>{" "}
            {cycle.startDate} → {cycle.endDate}
          </span>
          <span className="text-muted-foreground tabular-nums">
            Variable spent {formatMoney(cycle.totalVariableSpent, currency)} /{" "}
            {formatMoney(cycle.spendingBudget, currency)}
          </span>
        </div>
      )}

      {(s?.obligations.overdue.length ?? 0) > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-2 text-sm">
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-destructive">
              {s!.obligations.overdue.length} overdue bill(s).
            </span>{" "}
            Pay them below to stay on track.
          </p>
        </div>
      )}

      {/* Single monthly plan table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div>
            <p className="font-medium">Monthly plan</p>
            <p className="text-xs text-muted-foreground">
              Salary day {salaryDay} · all amounts in {currency}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onLogExpense}>
              <Receipt className="size-3.5" />
              Expense
            </Button>
            <Button size="sm" variant="outline" onClick={onTransferSavings}>
              Save
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {planRows.map((row) => (
            <div
              key={`${row.kind}-${row.label}`}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] uppercase",
                    row.kind === "income" && "border-emerald-500/50 text-emerald-700",
                    row.kind === "fixed" && "border-rose-500/50 text-rose-700",
                    row.kind === "savings" && "border-teal-500/50 text-teal-700",
                    row.kind === "variable" && "border-sky-500/50 text-sky-700",
                  )}
                >
                  {row.kind}
                </Badge>
                <span className="font-medium truncate">{row.label}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold tabular-nums">
                  {row.kind === "income" ? "+" : "−"}
                  {formatMoney(row.amount, currency)}
                </p>
                <p className="text-[11px] text-muted-foreground">{row.note}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 font-medium text-sm">
            <span>Left after plan</span>
            <span
              className={cn(
                "tabular-nums",
                remaining < 0 ? "text-destructive" : "text-emerald-600",
              )}
            >
              {formatMoney(remaining, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Variable budget progress */}
      {(s?.budgets.length ?? 0) > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <p className="font-medium">Variable spending</p>
          {s!.budgets.map((b) => (
            <div key={b.id} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>{b.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatMoney(b.spent, currency)} / {formatMoney(b.amount, currency)}
                </span>
              </div>
              <Progress value={Math.min(100, b.percentUsed)} className="h-2" />
              <p className="text-[11px] text-muted-foreground">
                {formatPercent(Math.max(0, 100 - b.percentUsed))} remaining
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Bills */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium flex items-center gap-2">
            <Home className="size-4" />
            Recurring bills
          </p>
          <Button size="sm" variant="ghost" onClick={onAddRecurring}>
            Edit
          </Button>
        </div>

        {!hasSalary ? (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Scheduled every month (active after you log salary):</p>
            <ul className="space-y-1.5">
              {recurring.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between rounded-lg border px-3 py-2"
                >
                  <span>{r.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoney(Number(r.amount), currency)} · day {r.dueDayOfMonth}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : bills.length === 0 ? (
          <p className="text-sm text-muted-foreground">All bills paid this cycle.</p>
        ) : (
          <div className="space-y-2">
            {bills.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
              >
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {o.name}
                    {o.status === "overdue" && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {format(parseISO(o.dueDate), "MMM d")} ·{" "}
                    {formatMoney(o.expectedAmount, currency)}
                  </p>
                </div>
                <Button size="sm" onClick={() => onPayObligation(o)}>
                  Pay
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {savingsGoal && (
        <div className="rounded-xl border bg-card p-4">
          <p className="font-medium mb-2">Savings — {savingsGoal.name}</p>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums">
              {formatMoney(savingsGoal.currentAmount, currency)} /{" "}
              {formatMoney(savingsGoal.targetAmount, currency)}
            </span>
          </div>
          <Progress value={savingsGoal.progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Transfer {formatMoney(savingsGoal.monthlyTargetAmount ?? 2_000, currency)} each
            month to My Saving.{" "}
            <Link href="/finance?tab=goals" className="text-primary underline">
              Details
            </Link>
          </p>
        </div>
      )}

      {loading && (
        <p className="text-center text-xs text-muted-foreground">Updating…</p>
      )}
    </div>
  );
}
