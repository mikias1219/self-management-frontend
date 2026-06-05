"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModuleRelations, type RelationLink } from "@/components/shared/module-relations";
import type {
  FinanceDialogMode,
  TxPreset,
  TxPresetValues,
} from "@/components/finance/finance-dialog";
import { colorForModuleKey } from "@/lib/constants/chart-colors";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { analyticsApi } from "@/lib/api/analytics";
import { financeApi } from "@/lib/api/finance";
import { settingsApi } from "@/lib/api/settings";
import { hasAuthToken } from "@/lib/api/client";
import type {
  Budget,
  ExpenseCategory,
  FinanceAccount,
  FinanceTransaction,
  IncomeCategory,
  SavingsGoal,
} from "@/lib/types";
import type { FinanceSummaryObligation } from "@/lib/types/finance";
import { CHART_PALETTE } from "@/lib/constants/chart-colors";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { useStandUi } from "@/stores/use-stand";

const MetricChart = dynamic(
  () =>
    import("@/components/shared/metric-chart").then((m) => ({
      default: m.MetricChart,
    })),
  {
    loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
  },
);

const FinanceDialog = dynamic(
  () =>
    import("@/components/finance/finance-dialog").then((m) => ({
      default: m.FinanceDialog,
    })),
  { ssr: false },
);

type DialogMode = FinanceDialogMode;

function classificationLabel(
  t?: ExpenseCategory["classificationType"],
): string | null {
  if (!t) return null;
  return t.replace(/_/g, " ");
}

export function FinanceModule() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const pageTab = useStandUi((s) => s.pageTab["finance"] ?? "overview");
  const setPageTab = useStandUi((s) => s.setPageTab);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [txPreset, setTxPreset] = useState<TxPreset>("default");
  const [txPresetValues, setTxPresetValues] = useState<TxPresetValues | undefined>();
  const [editing, setEditing] = useState<{ type: DialogMode; id: string } | null>(
    null,
  );

  const dialogOpen = dialogMode !== null;
  const onOverview = pageTab === "overview";
  const onTransactions = pageTab === "transactions";
  const onAccounts = pageTab === "accounts";
  const onBudgets = pageTab === "budgets";
  const onSavings = pageTab === "savings";
  const onObligations = pageTab === "obligations";
  const onCycle = pageTab === "cycle";
  const onCategories = pageTab === "categories";

  const summary = useStandData(
    ["finance", "summary", query],
    () => financeApi.getSummary(query),
    { enabled: authenticated },
  );
  const financeIntel = useStandData(
    ["analytics", "finance-intelligence", query],
    () => analyticsApi.getFinanceIntelligence(query),
    { enabled: authenticated && onOverview },
  );
  const accounts = useStandData(
    ["finance", "accounts"],
    () => financeApi.accounts.getAll(),
    { enabled: authenticated && (onAccounts || dialogOpen || onOverview) },
  );
  const transactions = useStandData(
    ["finance", "transactions", query],
    () => financeApi.transactions.getAll(query),
    { enabled: authenticated && (onTransactions || dialogOpen) },
  );
  const budgets = useStandData(
    ["finance", "budgets"],
    () => financeApi.budgets.getAll(),
    { enabled: authenticated && onBudgets },
  );
  const savings = useStandData(
    ["finance", "savings"],
    () => financeApi.savingsGoals.getAll(),
    { enabled: authenticated && onSavings },
  );
  const expenseCats = useStandData(
    ["finance", "expense-cats"],
    () => financeApi.expenseCategories.getAll(),
    { enabled: authenticated && (onCategories || dialogOpen) },
  );
  const incomeCats = useStandData(
    ["finance", "income-cats"],
    () => financeApi.incomeCategories.getAll(),
    { enabled: authenticated && (onCategories || dialogOpen) },
  );
  const recurring = useStandData(
    ["finance", "recurring"],
    () => financeApi.recurringObligations.getAll(),
    { enabled: authenticated && onObligations },
  );
  const allCycles = useStandData(
    ["finance", "cycles"],
    () => financeApi.cycles.getAll(),
    { enabled: authenticated && onCycle },
  );
  const userSettings = useStandData(["settings"], () => settingsApi.get(), {
    enabled: authenticated && onOverview,
  });

  const accountList = accounts.data ?? [];
  const expenseCatList = expenseCats.data ?? [];
  const incomeCatList = incomeCats.data ?? [];
  const s = summary.data;

  const financeLinks = useMemo((): RelationLink[] => {
    const t = s?.totals;
    if (!t) return [];
    return [
      {
        label: "Transactions",
        href: "/finance",
        value: t.transactionCount,
        color: colorForModuleKey("transactions"),
      },
      {
        label: "Savings rate",
        href: "/finance",
        value: `${t.savingsRate}%`,
        color: "#22c55e",
      },
      {
        label: "Budgets tracked",
        href: "/finance",
        value: s?.budgets.length ?? 0,
        color: "#f59e0b",
      },
    ];
  }, [s?.totals, s?.budgets.length]);

  const savingsDisplay = useMemo(() => {
    const goals = savings.data ?? [];
    const fromSummary = s?.savingsGoals ?? [];
    return goals.map((g) => {
      const enriched = fromSummary.find((sg) => sg.id === g.id);
      if (!enriched) return g;
      return {
        ...g,
        monthlyTargetAmount:
          enriched.monthlyTargetAmount ?? g.monthlyTargetAmount,
        projectedCompletionDate:
          enriched.projectedCompletionDate ?? g.projectedCompletionDate,
        savingsShortfallCarryForward:
          enriched.savingsShortfallCarryForward ?? g.savingsShortfallCarryForward,
      };
    });
  }, [savings.data, s?.savingsGoals]);

  const currentCycle = s?.currentCycle ?? null;

  const [allocation, setAllocation] = useState({
    fixedObligations: 0,
    savingsTarget: 0,
  });

  useEffect(() => {
    if (!currentCycle) return;
    setAllocation({
      fixedObligations: Number(currentCycle.fixedObligations),
      savingsTarget: Number(currentCycle.savingsTarget),
    });
  }, [currentCycle?.id, currentCycle?.fixedObligations, currentCycle?.savingsTarget]);

  const pastCycles = useMemo(
    () =>
      (allCycles.data ?? []).filter((c) => c.cycleStatus === "closed"),
    [allCycles.data],
  );

  const intel = financeIntel.data;
  const currency = intel?.currency ?? accountList[0]?.currency ?? "ETB";

  const invalidateFinance = [
    ["finance", "summary", query],
    ["finance", "accounts"],
    ["finance", "transactions", query],
    ["finance", "budgets"],
    ["finance", "savings"],
    ["finance", "cycles"],
    ["dashboard", "pos"], // keep main dashboard in sync (net balance, etc.)
  ];

  const createTx = useStandMutation(
    (p: Partial<FinanceTransaction>) => financeApi.transactions.create(p),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Transaction saved");
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Failed to save transaction")),
    },
  );
  const updateTx = useStandMutation(
    ({ id, data }: { id: string; data: Partial<FinanceTransaction> }) =>
      financeApi.transactions.update(id, data),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        setEditing(null);
        toast.success("Transaction updated");
      },
    },
  );
  const deleteTx = useStandMutation(
    (id: string) => financeApi.transactions.remove(id),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => toast.success("Transaction deleted"),
    },
  );

  const createAccount = useStandMutation(
    (p: Partial<FinanceAccount>) => financeApi.accounts.create(p),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Account created");
      },
    },
  );
  const updateAccount = useStandMutation(
    ({ id, data }: { id: string; data: Partial<FinanceAccount> }) =>
      financeApi.accounts.update(id, data),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        setEditing(null);
        toast.success("Account updated");
      },
    },
  );
  const deleteAccount = useStandMutation(
    (id: string) => financeApi.accounts.remove(id),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => toast.success("Account deleted"),
    },
  );

  const createBudget = useStandMutation(
    (p: Partial<Budget>) => financeApi.budgets.create(p),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Budget created");
      },
    },
  );
  const updateBudget = useStandMutation(
    ({ id, data }: { id: string; data: Partial<Budget> }) =>
      financeApi.budgets.update(id, data),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        setEditing(null);
        toast.success("Budget updated");
      },
    },
  );
  const deleteBudget = useStandMutation(
    (id: string) => financeApi.budgets.remove(id),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => toast.success("Budget deleted"),
    },
  );

  const createSavings = useStandMutation(
    (p: Partial<SavingsGoal>) => financeApi.savingsGoals.create(p),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Savings goal created");
      },
    },
  );
  const updateSavings = useStandMutation(
    ({ id, data }: { id: string; data: Partial<SavingsGoal> }) =>
      financeApi.savingsGoals.update(id, data),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => {
        setDialogMode(null);
        setEditing(null);
        toast.success("Savings goal updated");
      },
    },
  );
  const deleteSavings = useStandMutation(
    (id: string) => financeApi.savingsGoals.remove(id),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => toast.success("Savings goal deleted"),
    },
  );

  const createExpenseCat = useStandMutation(
    (p: Partial<ExpenseCategory>) => financeApi.expenseCategories.create(p),
    {
      invalidateKeys: [["finance", "expense-cats"], ...invalidateFinance],
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Category created");
      },
    },
  );
  const createIncomeCat = useStandMutation(
    (p: Partial<IncomeCategory>) => financeApi.incomeCategories.create(p),
    {
      invalidateKeys: [["finance", "income-cats"], ...invalidateFinance],
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Category created");
      },
    },
  );
  const createRecurring = useStandMutation(
    (p: Parameters<typeof financeApi.recurringObligations.create>[0]) =>
      financeApi.recurringObligations.create(p),
    {
      invalidateKeys: [["finance", "recurring"], ...invalidateFinance],
      onSuccess: () => {
        setDialogMode(null);
        toast.success("Recurring obligation created");
      },
    },
  );
  const updateAllocation = useStandMutation(
    (p: Parameters<typeof financeApi.cycles.updateAllocation>[0]) =>
      financeApi.cycles.updateAllocation(p),
    {
      invalidateKeys: invalidateFinance,
      onSuccess: () => toast.success("Cycle allocation updated"),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Allocation failed")),
    },
  );

  const catName = (id: string | undefined, type: "expense" | "income") => {
    if (!id) return "—";
    const list = type === "expense" ? expenseCatList : incomeCatList;
    return list.find((c) => c.id === id)?.name ?? "—";
  };

  const txColumns: DataTableColumn<FinanceTransaction>[] = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        cell: (r) => format(new Date(r.transactionDate), "MMM d, yyyy"),
      },
      {
        key: "type",
        header: "Type",
        cell: (r) => (
          <span className="flex items-center gap-1.5">
            {r.transactionType}
            {r.needsReview && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                Review
              </Badge>
            )}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (r) => formatMoney(Number(r.amount), r.currency),
      },
      {
        key: "account",
        header: "Account",
        cell: (r) =>
          accountList.find((a) => a.id === r.accountId)?.name ?? "—",
      },
      {
        key: "category",
        header: "Category",
        cell: (r) =>
          r.transactionType === "income"
            ? catName(r.categoryId, "income")
            : catName(r.categoryId, "expense"),
      },
      { key: "desc", header: "Description", cell: (r) => r.description ?? "—" },
    ],
    [accountList, expenseCatList, incomeCatList],
  );

  const accountColumns: DataTableColumn<FinanceAccount>[] = [
    { key: "name", header: "Account", cell: (r) => r.name },
    { key: "type", header: "Type", cell: (r) => r.accountType },
    {
      key: "balance",
      header: "Balance",
      cell: (r) => formatMoney(Number(r.balance), r.currency),
    },
  ];

  const cashFlowChart = (s?.dailyCashFlow ?? []).map((d) => ({
    name: format(new Date(d.date), "MMM d"),
    value: d.net,
    color: d.net >= 0 ? "#22c55e" : "#ef4444",
  }));

  const expenseChart = (s?.expenseByCategory ?? []).map((c, i) => ({
    name: c.name,
    value: c.amount,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  const openAdd = (mode: DialogMode) => {
    setEditing(null);
    setTxPreset("default");
    setTxPresetValues(undefined);
    setDialogMode(mode);
  };

  const openTransaction = (preset: TxPreset = "default", values?: TxPresetValues) => {
    if (accountList.length === 0) {
      toast.error("Add a checking account first (Accounts tab)");
      return;
    }
    setEditing(null);
    setTxPreset(preset);
    setTxPresetValues(values);
    setDialogMode("transaction");
  };

  const payObligation = (o: FinanceSummaryObligation) => {
    const checkingAccount = accountList.find((a) => a.accountType === "checking");
    openTransaction("pay_obligation", {
      transactionType: "expense",
      amount: o.expectedAmount,
      pendingObligationId: o.id,
      description: `Payment: ${o.name}`,
      accountId: checkingAccount?.id ?? accountList[0]?.id,
    });
  };

  const confirmDelete = (label: string, fn: () => void) => {
    if (window.confirm(`Delete this ${label}?`)) fn();
  };

  if (!authenticated) {
    return (
      <ModuleShell
        title="Finance"
        description="Accounts, budgets, savings, and cash flow."
        icon={DollarSign}
        iconClassName="bg-amber-500/15 text-amber-700"
      >
        <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          Sign in to manage your finances.
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Finance"
      description={`Income, expenses, budgets & savings — ${label}`}
      icon={DollarSign}
      iconClassName="bg-amber-500/15 text-amber-700"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => openTransaction("salary")}>
            <DollarSign className="size-4" />
            Log salary
          </Button>
          <Button size="sm" variant="outline" onClick={() => openTransaction("expense")}>
            <Receipt className="size-4" />
            Expense
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openTransaction("savings_transfer")}
          >
            <ArrowRightLeft className="size-4" />
            Save
          </Button>
        </div>
      }
    >
      <StatGrid>
        <StatCard
          title="Net worth"
          value={formatMoney(s?.totals.netWorth ?? 0, currency)}
          icon={Wallet}
          loading={summary.isLoading}
        />
        <StatCard
          title="Income"
          value={formatMoney(intel?.monthly.income ?? s?.totals.totalIncome ?? 0, currency)}
          icon={TrendingUp}
          description={`${label}`}
          loading={summary.isLoading}
        />
        <StatCard
          title="Expenses"
          value={formatMoney(intel?.monthly.expense ?? s?.totals.totalExpense ?? 0, currency)}
          icon={TrendingDown}
          description={`Burn ${formatMoney(intel?.burnRate ?? s?.totals.burnRate ?? 0, currency)}/day`}
          loading={summary.isLoading}
        />
        <StatCard
          title="Savings rate"
          value={formatPercent(intel?.monthly.savingsRate ?? s?.totals.savingsRate ?? 0)}
          icon={PiggyBank}
          description={
            intel?.topOverspendCategory
              ? `Watch ${intel.topOverspendCategory}`
              : "Projected net"
          }
          loading={financeIntel.isLoading}
        />
      </StatGrid>

      <ModuleRelations links={financeLinks} />

      <Tabs value={pageTab} onValueChange={(v) => setPageTab("finance", v)}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="obligations">
            Obligations
            {(s?.obligations.overdue.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 px-1.5">
                {s!.obligations.overdue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cycle">Cycle</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {pageTab === "overview" && (
        <div className="mt-4 space-y-6">
          {(!s?.currentCycle || Number(s.currentCycle.netSalary) === 0) && (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5 space-y-3">
              <p className="font-medium flex items-center gap-2">
                <Calendar className="size-4" />
                Get started with salary-based cycles
              </p>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Set your{" "}
                  <Link href="/settings" className="text-primary underline">
                    salary day
                  </Link>{" "}
                  (currently day {userSettings.data?.salaryDay ?? 25})
                </li>
                <li>Add a checking account and a savings account</li>
                <li>Log your salary — this opens your first cycle</li>
                <li>Allocate fixed costs, savings, and spending on the Cycle tab</li>
              </ol>
              <Button size="sm" onClick={() => openTransaction("salary")}>
                Log salary now
              </Button>
            </div>
          )}

          {s?.currentCycle && (
            <div className="rounded-xl border bg-card p-4 text-sm space-y-2">
              <p className="font-medium">
                Salary cycle: {s.currentCycle.startDate} → {s.currentCycle.endDate}
              </p>
              <p className="text-muted-foreground">
                Net salary {formatMoney(s.currentCycle.netSalary, currency)} ·
                Variable spent {formatMoney(s.currentCycle.totalVariableSpent, currency)} ·
                Health score {s.currentCycle.financialHealthScore}/100
              </p>
              {s.currentCycle.remainingUnallocated !== 0 && (
                <p className="text-amber-600">
                  Unallocated: {formatMoney(s.currentCycle.remainingUnallocated, currency)}
                </p>
              )}
            </div>
          )}

          {(s?.obligations.overdue.length ?? 0) > 0 && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-destructive flex items-center gap-1.5">
                  <AlertCircle className="size-4" />
                  {s!.obligations.overdue.length} overdue obligation(s)
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay these from the Obligations tab or log an expense linked to each.
                </p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => setPageTab("finance", "obligations")}>
                View
              </Button>
            </div>
          )}

          {/* Main tracking card */}
          <div className="rounded-xl border bg-card p-5 space-y-6">
            {/* Income row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Income received this month</p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
                  {formatMoney(intel?.monthly.income ?? 0, currency)}
                </p>
              </div>
              <Button onClick={() => openTransaction("salary")}>
                <Plus className="size-4" /> Log salary
              </Button>
            </div>

            {/* Budgets */}
            <div className="border-t pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Monthly budgets (planned fixed costs)</p>
                <Button variant="ghost" size="sm" onClick={() => setPageTab("finance", "budgets")}>
                  Manage budgets
                </Button>
              </div>

              {(s?.budgets ?? []).length === 0 ? (
                <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                  No budgets created yet. Create budgets for Rent, Food, Transport, Utilities etc. so every expense is tracked against your salary.
                </div>
              ) : (
                <div className="space-y-4">
                  {s!.budgets.map((b) => (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{b.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatMoney(b.spent, currency)} / {formatMoney(b.amount, currency)}
                        </span>
                      </div>
                      <Progress value={Math.min(100, b.percentUsed)} />
                      <p className="text-[11px] text-muted-foreground">
                        {b.percentUsed >= 100
                          ? "Budget fully used"
                          : `${formatPercent(100 - b.percentUsed)} remaining`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remaining for savings */}
            <div className="border-t pt-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Unallocated in cycle plan</p>
                  <p className="text-2xl font-semibold tabular-nums text-emerald-600">
                    {formatMoney(
                      Math.max(0, s?.currentCycle?.remainingUnallocated ?? 0),
                      currency,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    After fixed, savings target, and sub-budgets
                  </p>
                </div>
                <Button variant="outline" onClick={() => setPageTab("finance", "savings")}>
                  View savings goals
                </Button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => openTransaction("salary")}>
              Log salary
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openTransaction("expense")}>
              Log expense
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openTransaction("savings_transfer")}>
              Transfer to savings
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPageTab("finance", "cycle")}>
              Plan cycle
            </Button>
          </div>

          {/* Charts only when there is data */}
          {intel && intel.spendingByCategory.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetricChart
                title="Daily net cash flow"
                data={cashFlowChart}
                type="bar"
                loading={summary.isLoading}
                height={220}
                multiColor
              />
              <MetricChart
                title="Expenses by category"
                data={expenseChart}
                type="pie"
                loading={summary.isLoading}
                height={220}
                multiColor
              />
            </div>
          )}
        </div>
        )}

        {pageTab === "transactions" && (
        <div className="mt-4">
          <DataTable
            columns={txColumns}
            data={transactions.data ?? []}
            loading={transactions.isLoading}
            getRowId={(r) => r.id}
            emptyMessage="No transactions yet. Add your salary as income, then log expenses against your budgets."
            onEdit={(row) => {
              setEditing({ type: "transaction", id: row.id });
              setTxPreset("default");
              setTxPresetValues(undefined);
              setDialogMode("transaction");
            }}
            onDelete={(row) =>
              confirmDelete("transaction", () => deleteTx.mutate(row.id))
            }
          />
        </div>
        )}

        {pageTab === "accounts" && (
        <div className="mt-4 space-y-4">
          <Button size="sm" variant="outline" onClick={() => openAdd("account")}>
            <Plus className="size-4" /> Add account
          </Button>
          <DataTable
            columns={accountColumns}
            data={accountList}
            loading={accounts.isLoading}
            getRowId={(r) => r.id}
            onEdit={(row) => {
              setEditing({ type: "account", id: row.id });
              setDialogMode("account");
            }}
            onDelete={(row) =>
              confirmDelete("account", () => deleteAccount.mutate(row.id))
            }
          />
        </div>
        )}

        {pageTab === "budgets" && (
        <div className="mt-4 space-y-4">
          <Button size="sm" variant="outline" onClick={() => openAdd("budget")}>
            <Plus className="size-4" /> Add budget
          </Button>
          <div className="grid gap-3 md:grid-cols-2">
            {(budgets.data ?? []).map((b) => {
              const amount = Number(b.amount);
              const spent = Number(b.spent);
              const pct = amount > 0 ? (spent / amount) * 100 : 0;
              return (
                <div key={b.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.periodStart} → {b.periodEnd}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing({ type: "budget", id: b.id });
                          setDialogMode("budget");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          confirmDelete("budget", () => deleteBudget.mutate(b.id))
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {formatMoney(spent, currency)} / {formatMoney(amount, currency)}
                  </p>
                  <Progress className="mt-2" value={Math.min(100, pct)} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Remaining {formatMoney(Math.max(0, amount - spent), currency)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {pageTab === "obligations" && (
        <div className="mt-4 space-y-6">
          {!s?.currentCycle ? (
            <p className="text-sm text-muted-foreground">
              Open a cycle by logging salary, then pending bills appear here each cycle.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Cycle {s.currentCycle.startDate} → {s.currentCycle.endDate}. Pay bills with one
                tap — amounts pre-fill from your recurring setup.
              </p>
              {(s.obligations.overdue.length > 0 ||
                s.obligations.upcoming.length > 0) && (
                <div className="space-y-2">
                  {[...s.obligations.overdue, ...s.obligations.upcoming].map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-4 py-3"
                    >
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {o.name}
                          {o.status === "overdue" && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due {o.dueDate} · {formatMoney(o.expectedAmount, currency)}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => payObligation(o)}>
                        Pay
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {s.obligations.overdue.length === 0 &&
                s.obligations.upcoming.length === 0 && (
                  <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-6 text-center">
                    No pending obligations. Add recurring bills on the Cycle tab.
                  </p>
                )}
              {s.obligations.paidThisCycle.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Paid this cycle</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {s.obligations.paidThisCycle.map((o) => (
                      <li key={o.id} className="flex justify-between rounded border px-3 py-2">
                        <span>{o.name}</span>
                        <span>{formatMoney(o.expectedAmount, currency)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          <div className="flex items-center justify-between pt-2 border-t">
            <h3 className="text-sm font-medium">Recurring templates</h3>
            <Button size="sm" variant="outline" onClick={() => openAdd("recurring")}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(recurring.data ?? []).map((r) => (
              <li key={r.id} className="rounded border px-3 py-2 flex justify-between">
                <span>{r.name}</span>
                <span className="text-muted-foreground">
                  {formatMoney(Number(r.amount), currency)} · day {r.dueDayOfMonth}
                </span>
              </li>
            ))}
          </ul>
        </div>
        )}

        {pageTab === "cycle" && (
        <div className="mt-4 space-y-4">
          {currentCycle ? (
            <>
              {(() => {
                const netSalary = Number(currentCycle.netSalary);
                const spendingBudget = Math.round(
                  (netSalary -
                    allocation.fixedObligations -
                    allocation.savingsTarget) *
                    100,
                ) / 100;
                const allocationValid =
                  allocation.fixedObligations + allocation.savingsTarget <=
                  netSalary + 0.001;
                return (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <p className="font-medium">Cycle allocation</p>
                <p className="text-sm text-muted-foreground">
                  Net salary {formatMoney(netSalary, currency)} — set fixed and
                  savings; spending fills the remainder.
                </p>
                <form
                  className="grid gap-3 sm:grid-cols-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!allocationValid) {
                      toast.error(
                        `Fixed + savings cannot exceed net salary (${formatMoney(netSalary, currency)})`,
                      );
                      return;
                    }
                    updateAllocation.mutate({
                      fixedObligations: allocation.fixedObligations,
                      savingsTarget: allocation.savingsTarget,
                      spendingBudget: Math.max(0, spendingBudget),
                    });
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="fixedObligations">Fixed obligations</Label>
                    <Input
                      id="fixedObligations"
                      type="number"
                      step="0.01"
                      min="0"
                      value={allocation.fixedObligations}
                      onChange={(e) =>
                        setAllocation((a) => ({
                          ...a,
                          fixedObligations: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="savingsTarget">Savings target</Label>
                    <Input
                      id="savingsTarget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={allocation.savingsTarget}
                      onChange={(e) =>
                        setAllocation((a) => ({
                          ...a,
                          savingsTarget: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium leading-none">
                      Spending budget (sent on save)
                    </p>
                    <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm tabular-nums">
                      {formatMoney(Math.max(0, spendingBudget), currency)}
                    </p>
                    <p
                      className={`text-xs tabular-nums ${
                        allocationValid ? "text-muted-foreground" : "text-destructive"
                      }`}
                    >
                      {allocationValid
                        ? `Remaining after save: ${formatMoney(0, currency)}`
                        : `Over by ${formatMoney(
                            allocation.fixedObligations +
                              allocation.savingsTarget -
                              netSalary,
                            currency,
                          )}`}
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <Button type="submit" size="sm" disabled={!allocationValid}>
                      Save allocation
                    </Button>
                  </div>
                </form>
              </div>
                );
              })()}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Fixed paid</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatMoney(currentCycle.totalFixedObligations, currency)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Savings transferred</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatMoney(currentCycle.totalSavingsAllocated, currency)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Variable spent</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatMoney(currentCycle.totalVariableSpent, currency)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Remaining balance</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatMoney(currentCycle.remainingBalance, currency)}
                  </p>
                </div>
              </div>

              {pastCycles.length > 0 && (
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-medium">Past cycles</h3>
                  <ul className="space-y-2 text-sm">
                    {pastCycles.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
                      >
                        <span>
                          {c.startDate} → {c.endDate}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          Net {formatMoney(Number(c.netSalary), currency)} ·
                          Savings {formatPercent(Number(c.actualSavingsRate ?? 0))} ·
                          Health {c.financialHealthScore ?? 0}/100
                          {c.largestExpenseCategory
                            ? ` · Top: ${c.largestExpenseCategory}`
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No open cycle. Log a salary income transaction to start a cycle.
            </p>
          )}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Recurring obligations (rent, etc.)</h3>
              <Button size="sm" variant="outline" onClick={() => openAdd("recurring")}>
                Add
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              {(recurring.data ?? []).map((r) => (
                <li key={r.id} className="rounded border px-3 py-2 flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(Number(r.amount), currency)} · day {r.dueDayOfMonth}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        {pageTab === "savings" && (
        <div className="mt-4 space-y-4">
          <Button size="sm" variant="outline" onClick={() => openAdd("savings")}>
            <Plus className="size-4" /> Add savings goal
          </Button>
          <div className="grid gap-3 md:grid-cols-2">
            {savingsDisplay.map((g) => {
              const target = Number(g.targetAmount);
              const current = Number(g.currentAmount);
              const pct = target > 0 ? (current / target) * 100 : 0;
              return (
                <div key={g.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{g.name}</p>
                      {g.monthlyTargetAmount != null && g.monthlyTargetAmount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Monthly target {formatMoney(g.monthlyTargetAmount, currency)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openTransaction("savings_transfer", { savingsGoalId: g.id })
                        }
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing({ type: "savings", id: g.id });
                          setDialogMode("savings");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          confirmDelete("goal", () => deleteSavings.mutate(g.id))
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {formatMoney(current, currency)} / {formatMoney(target, currency)}
                  </p>
                  <Progress className="mt-2" value={Math.min(100, pct)} />
                  {g.projectedCompletionDate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      On track by {g.projectedCompletionDate}
                    </p>
                  )}
                  {(g.savingsShortfallCarryForward ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Shortfall carry-forward:{" "}
                      {formatMoney(g.savingsShortfallCarryForward!, currency)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {pageTab === "categories" && (
        <div className="mt-4 space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Expense categories</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAdd("expense-cat")}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {expenseCatList.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
                  style={
                    c.color ? { borderColor: c.color, color: c.color } : undefined
                  }
                >
                  {c.name}
                  {c.classificationType && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {classificationLabel(c.classificationType)}
                    </Badge>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Income categories</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAdd("income-cat")}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {incomeCatList.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border px-3 py-1 text-sm"
                  style={
                    c.color ? { borderColor: c.color, color: c.color } : undefined
                  }
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        )}
      </Tabs>

      {dialogMode && (
      <FinanceDialog
        mode={dialogMode}
        open
        txPreset={txPreset}
        presetValues={txPresetValues}
        cyclePeriod={
          s?.currentCycle
            ? { start: s.currentCycle.startDate, end: s.currentCycle.endDate }
            : undefined
        }
        onOpenChange={(o) => {
          if (!o) {
            setDialogMode(null);
            setEditing(null);
            setTxPreset("default");
            setTxPresetValues(undefined);
          }
        }}
        accounts={accountList}
        expenseCats={expenseCatList}
        incomeCats={incomeCatList}
        savingsGoals={savings.data ?? []}
        pendingObligations={[
          ...(s?.obligations.upcoming ?? []),
          ...(s?.obligations.overdue ?? []),
        ]}
        editingId={editing?.id}
        editTx={
          editing?.type === "transaction"
            ? (transactions.data ?? []).find((t) => t.id === editing.id)
            : undefined
        }
        editSavings={
          editing?.type === "savings"
            ? (savings.data ?? []).find((g) => g.id === editing.id)
            : undefined
        }
        editAccount={
          editing?.type === "account"
            ? accountList.find((a) => a.id === editing.id)
            : undefined
        }
        editBudget={
          editing?.type === "budget"
            ? (budgets.data ?? []).find((b) => b.id === editing.id)
            : undefined
        }
        onSubmitTx={(data) => {
          if (editing?.type === "transaction") {
            updateTx.mutate({ id: editing.id, data });
          } else {
            createTx.mutate(data);
          }
        }}
        onSubmitAccount={(data) => {
          if (editing?.type === "account") {
            updateAccount.mutate({ id: editing.id, data });
          } else {
            createAccount.mutate(data);
          }
        }}
        onSubmitBudget={(data) => {
          if (editing?.type === "budget") {
            updateBudget.mutate({ id: editing.id, data });
          } else {
            createBudget.mutate(data);
          }
        }}
        onSubmitSavings={(data) => {
          if (editing?.type === "savings") {
            updateSavings.mutate({ id: editing.id, data });
          } else {
            createSavings.mutate(data);
          }
        }}
        onSubmitExpenseCat={(data) => createExpenseCat.mutate(data)}
        onSubmitIncomeCat={(data) => createIncomeCat.mutate(data)}
        onSubmitRecurring={(data) => createRecurring.mutate(data)}
      />
      )}
    </ModuleShell>
  );
}
