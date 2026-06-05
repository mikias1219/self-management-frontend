"use client";

import { format } from "date-fns";
import {
  DollarSign,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ModuleShell } from "@/components/shared/module-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { MetricChart } from "@/components/shared/metric-chart";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModuleRelations } from "@/components/shared/module-relations";
import { FormField, FormSelect } from "@/components/shared/form-fields";
import { useFinanceRelations } from "@/hooks/use-module-relations";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";
import { usePeriod } from "@/hooks/use-period";
import { analyticsApi, financeApi } from "@/lib/api";
import { hasAuthToken } from "@/lib/api/client";
import type {
  Budget,
  ExpenseCategory,
  FinanceAccount,
  FinanceTransaction,
  IncomeCategory,
  SavingsGoal,
} from "@/lib/types";
import type { AccountType, TransactionType } from "@/lib/types/finance";
import { CHART_PALETTE } from "@/lib/constants/chart-colors";
import { formatMoney, formatPercent } from "@/lib/utils/period";
import { useStandUi } from "@/stores/use-stand";

const ACCOUNT_TYPES: AccountType[] = [
  "checking",
  "savings",
  "credit",
  "cash",
  "investment",
];
const TX_TYPES: TransactionType[] = ["income", "expense", "transfer"];

type DialogMode =
  | "transaction"
  | "account"
  | "budget"
  | "savings"
  | "expense-cat"
  | "income-cat"
  | null;

export function FinanceModule() {
  const { query, label } = usePeriod();
  const authenticated = hasAuthToken();
  const pageTab = useStandUi((s) => s.pageTab["finance"] ?? "overview");
  const setPageTab = useStandUi((s) => s.setPageTab);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editing, setEditing] = useState<{ type: DialogMode; id: string } | null>(
    null,
  );

  const summary = useStandData(
    ["finance", "summary", query],
    () => financeApi.getSummary(query),
    { enabled: authenticated },
  );
  const financeIntel = useStandData(
    ["analytics", "finance-intelligence", query],
    () => analyticsApi.getFinanceIntelligence(query),
    { enabled: authenticated },
  );
  const accounts = useStandData(["finance", "accounts"], () =>
    financeApi.accounts.getAll(),
  );
  const transactions = useStandData(
    ["finance", "transactions", query],
    () => financeApi.transactions.getAll(query),
    { enabled: authenticated },
  );
  const budgets = useStandData(["finance", "budgets"], () =>
    financeApi.budgets.getAll(),
  );
  const savings = useStandData(["finance", "savings"], () =>
    financeApi.savingsGoals.getAll(),
  );
  const expenseCats = useStandData(["finance", "expense-cats"], () =>
    financeApi.expenseCategories.getAll(),
  );
  const incomeCats = useStandData(["finance", "income-cats"], () =>
    financeApi.incomeCategories.getAll(),
  );

  const accountList = accounts.data ?? [];
  const expenseCatList = expenseCats.data ?? [];
  const incomeCatList = incomeCats.data ?? [];
  const { links: financeLinks } = useFinanceRelations();
  const s = summary.data;
  const intel = financeIntel.data;
  const currency = intel?.currency ?? accountList[0]?.currency ?? "ETB";

  const invalidateFinance = [
    ["finance", "summary", query],
    ["finance", "accounts"],
    ["finance", "transactions", query],
    ["finance", "budgets"],
    ["finance", "savings"],
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
      onError: () => toast.error("Failed to save transaction"),
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
      { key: "type", header: "Type", cell: (r) => r.transactionType },
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
    setDialogMode(mode);
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
        <Button size="sm" onClick={() => openAdd("transaction")}>
          <Plus className="size-4" />
          Add transaction
        </Button>
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
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Clear business rule explanation */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-medium text-primary">How tracking works</p>
            <ol className="mt-2 list-decimal pl-5 text-muted-foreground space-y-0.5">
              <li>Log your salary as <strong>Income</strong> → it increases your balance and counts as "received".</li>
              <li>Create <strong>Budgets</strong> for fixed monthly costs (Rent 7,500, Groceries, etc.).</li>
              <li>Every expense you log against a budget category updates the progress bar automatically.</li>
              <li>What remains after your budgeted amounts = money available for savings or buffer.</li>
            </ol>
          </div>

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
              <Button
                onClick={() => {
                  setDialogMode("transaction");
                  // The dialog will default to expense; user can change to income
                }}
              >
                <Plus className="size-4" /> Log salary / income
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
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Available for savings / buffer</p>
                  <p className="text-2xl font-semibold tabular-nums text-emerald-600">
                    {formatMoney(
                      Math.max(
                        0,
                        (intel?.monthly.income ?? 0) -
                          (s?.budgets?.reduce((sum, b) => sum + b.amount, 0) ?? 0),
                      ),
                      currency,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Income received minus total budgeted amounts
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
            <Button variant="secondary" size="sm" onClick={() => setPageTab("finance", "transactions")}>
              Log an expense
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPageTab("finance", "budgets")}>
              Create / edit budgets
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPageTab("finance", "savings")}>
              Set a savings goal
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
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <DataTable
            columns={txColumns}
            data={transactions.data ?? []}
            loading={transactions.isLoading}
            getRowId={(r) => r.id}
            emptyMessage="No transactions yet. Add your salary as income, then log expenses against your budgets."
            onEdit={(row) => {
              setEditing({ type: "transaction", id: row.id });
              setDialogMode("transaction");
            }}
            onDelete={(row) =>
              confirmDelete("transaction", () => deleteTx.mutate(row.id))
            }
          />
        </TabsContent>

        <TabsContent value="accounts" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="budgets" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="savings" className="mt-4 space-y-4">
          <Button size="sm" variant="outline" onClick={() => openAdd("savings")}>
            <Plus className="size-4" /> Add savings goal
          </Button>
          <div className="grid gap-3 md:grid-cols-2">
            {(savings.data ?? []).map((g) => {
              const target = Number(g.targetAmount);
              const current = Number(g.currentAmount);
              const pct = target > 0 ? (current / target) * 100 : 0;
              return (
                <div key={g.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{g.name}</p>
                    <div className="flex gap-1">
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
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-6">
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
        </TabsContent>
      </Tabs>

      <FinanceDialog
        mode={dialogMode}
        open={!!dialogMode}
        onOpenChange={(o) => {
          if (!o) {
            setDialogMode(null);
            setEditing(null);
          }
        }}
        accounts={accountList}
        expenseCats={expenseCatList}
        incomeCats={incomeCatList}
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
      />
    </ModuleShell>
  );
}

function FinanceDialog({
  mode,
  open,
  onOpenChange,
  accounts,
  expenseCats,
  incomeCats,
  editingId,
  editTx,
  editSavings,
  editAccount,
  editBudget,
  onSubmitTx,
  onSubmitAccount,
  onSubmitBudget,
  onSubmitSavings,
  onSubmitExpenseCat,
  onSubmitIncomeCat,
}: {
  mode: DialogMode;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  accounts: FinanceAccount[];
  expenseCats: ExpenseCategory[];
  incomeCats: IncomeCategory[];
  editingId?: string;
  editTx?: FinanceTransaction;
  editSavings?: SavingsGoal;
  editAccount?: FinanceAccount;
  editBudget?: Budget;
  onSubmitTx: (d: Partial<FinanceTransaction>) => void;
  onSubmitAccount: (d: Partial<FinanceAccount>) => void;
  onSubmitBudget: (d: Partial<Budget>) => void;
  onSubmitSavings: (d: Partial<SavingsGoal>) => void;
  onSubmitExpenseCat: (d: Partial<ExpenseCategory>) => void;
  onSubmitIncomeCat: (d: Partial<IncomeCategory>) => void;
}) {
  if (!mode) return null;

  const titles: Record<NonNullable<DialogMode>, string> = {
    transaction: editingId ? "Edit transaction" : "Add transaction",
    account: editingId ? "Edit account" : "Add account",
    budget: editingId ? "Edit budget" : "Add budget",
    savings: editingId ? "Edit savings goal" : "Add savings goal",
    "expense-cat": "Add expense category",
    "income-cat": "Add income category",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            Balances update automatically from transactions.
          </DialogDescription>
        </DialogHeader>

        {mode === "transaction" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const type = fd.get("transactionType") as TransactionType;
              onSubmitTx({
                accountId: String(fd.get("accountId")),
                transactionType: type,
                amount: Number(fd.get("amount")),
                currency: String(fd.get("currency") ?? "ETB"),
                transactionDate: String(fd.get("transactionDate")),
                description: String(fd.get("description") ?? "").trim() || undefined,
                categoryId: String(fd.get("categoryId") ?? "") || undefined,
                incomeSource:
                  type === "income"
                    ? (String(fd.get("incomeSource") ?? "") as FinanceTransaction["incomeSource"]) ||
                      undefined
                    : undefined,
                paymentMethod:
                  type === "expense"
                    ? (String(fd.get("paymentMethod") ?? "") as FinanceTransaction["paymentMethod"]) ||
                      undefined
                    : undefined,
                isRecurring: fd.get("isRecurring") === "on",
                recurringInterval: String(
                  fd.get("recurringInterval") ?? "none",
                ) as FinanceTransaction["recurringInterval"],
                linkedTaskId: String(fd.get("linkedTaskId") ?? "") || undefined,
              });
            }}
          >
            <FormSelect
              label="Account"
              name="accountId"
              required
              defaultValue={editTx?.accountId ?? accounts[0]?.id}
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Type"
                name="transactionType"
                defaultValue={editTx?.transactionType ?? "expense"}
                options={TX_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <FormField
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={editTx?.amount}
              />
            </div>
            <FormField
              label="Currency"
              name="currency"
              defaultValue={editTx?.currency ?? "ETB"}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Income source"
                name="incomeSource"
                defaultValue={editTx?.incomeSource ?? "salary"}
                options={[
                  { value: "salary", label: "Salary" },
                  { value: "freelance", label: "Freelance" },
                  { value: "business", label: "Business" },
                  { value: "investment", label: "Investment" },
                  { value: "gift", label: "Gift" },
                  { value: "other", label: "Other" },
                ]}
              />
              <FormSelect
                label="Payment method"
                name="paymentMethod"
                defaultValue={editTx?.paymentMethod ?? "cash"}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "mobile", label: "Mobile" },
                  { value: "bank_transfer", label: "Bank transfer" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
            <FormSelect
              label="Recurring"
              name="recurringInterval"
              defaultValue={editTx?.recurringInterval ?? "none"}
              options={[
                { value: "none", label: "One-time" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isRecurring"
                defaultChecked={editTx?.isRecurring}
              />
              Recurring transaction
            </label>
            <FormField
              label="Date"
              name="transactionDate"
              type="date"
              required
              defaultValue={
                editTx?.transactionDate ?? format(new Date(), "yyyy-MM-dd")
              }
            />
            <FormSelect
              label="Category"
              name="categoryId"
              defaultValue={editTx?.categoryId ?? ""}
              options={[
                { value: "", label: "None" },
                ...expenseCats.map((c) => ({ value: c.id, label: c.name })),
                ...incomeCats.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <FormField
              label="Description"
              name="description"
              defaultValue={editTx?.description}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "account" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitAccount({
                name: String(fd.get("name")),
                accountType: fd.get("accountType") as AccountType,
                balance: Number(fd.get("balance") ?? 0),
                currency: String(fd.get("currency") ?? "ETB"),
              });
            }}
          >
            <FormField
              label="Name"
              name="name"
              required
              defaultValue={editAccount?.name}
            />
            <FormSelect
              label="Type"
              name="accountType"
              defaultValue={editAccount?.accountType ?? "checking"}
              options={ACCOUNT_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Opening balance"
                name="balance"
                type="number"
                step="0.01"
                defaultValue={editAccount?.balance ?? "0"}
              />
              <FormField
                label="Currency"
                name="currency"
                defaultValue={editAccount?.currency ?? "ETB"}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save account</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "budget" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitBudget({
                name: String(fd.get("name")),
                amount: Number(fd.get("amount")),
                periodStart: String(fd.get("periodStart")),
                periodEnd: String(fd.get("periodEnd")),
                categoryId: String(fd.get("categoryId") ?? "") || undefined,
              });
            }}
          >
            <FormField
              label="Budget name"
              name="name"
              required
              defaultValue={editBudget?.name}
            />
            <FormField
              label="Limit amount"
              name="amount"
              type="number"
              step="0.01"
              required
              defaultValue={editBudget?.amount}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Period start"
                name="periodStart"
                type="date"
                required
                defaultValue={editBudget?.periodStart}
              />
              <FormField
                label="Period end"
                name="periodEnd"
                type="date"
                required
                defaultValue={editBudget?.periodEnd}
              />
            </div>
            <FormSelect
              label="Expense category (optional)"
              name="categoryId"
              defaultValue={editBudget?.categoryId ?? ""}
              options={[
                { value: "", label: "All expenses" },
                ...expenseCats.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <DialogFooter>
              <Button type="submit">Save budget</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "savings" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitSavings({
                name: String(fd.get("name")),
                targetAmount: Number(fd.get("targetAmount")),
                currentAmount: Number(fd.get("currentAmount") ?? 0),
                targetDate: String(fd.get("targetDate") ?? "") || undefined,
              });
            }}
          >
            <FormField label="Goal name" name="name" required defaultValue={editSavings?.name} />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Target"
                name="targetAmount"
                type="number"
                step="0.01"
                required
                defaultValue={editSavings?.targetAmount}
              />
              <FormField
                label="Current saved"
                name="currentAmount"
                type="number"
                step="0.01"
                defaultValue={editSavings?.currentAmount ?? 0}
              />
            </div>
            <FormField
              label="Target date"
              name="targetDate"
              type="date"
              defaultValue={editSavings?.targetDate}
            />
            <DialogFooter>
              <Button type="submit">Save goal</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "expense-cat" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitExpenseCat({
                name: String(fd.get("name")),
                color: String(fd.get("color") ?? "") || undefined,
              });
            }}
          >
            <FormField label="Category name" name="name" required />
            <FormField label="Color (hex)" name="color" placeholder="#ef4444" />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "income-cat" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitIncomeCat({
                name: String(fd.get("name")),
                color: String(fd.get("color") ?? "") || undefined,
              });
            }}
          >
            <FormField label="Category name" name="name" required />
            <FormField label="Color (hex)" name="color" placeholder="#22c55e" />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
