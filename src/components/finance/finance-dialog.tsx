"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField, FormSelect } from "@/components/shared/form-fields";
import type {
  AccountType,
  Budget,
  ExpenseCategory,
  FinanceAccount,
  FinanceTransaction,
  IncomeCategory,
  SavingsGoal,
  TransactionType,
} from "@/lib/types";

const ACCOUNT_TYPES: AccountType[] = [
  "checking",
  "savings",
  "credit",
  "cash",
  "investment",
];
const TX_TYPES: TransactionType[] = ["income", "expense", "transfer"];

function parseMoney(value: FormDataEntryValue | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function optionalUuid(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? "").trim();
  return s || undefined;
}

export type FinanceDialogMode =
  | "transaction"
  | "account"
  | "budget"
  | "savings"
  | "expense-cat"
  | "income-cat"
  | "recurring"
  | null;

export type TxPreset = "default" | "salary" | "expense" | "savings_transfer" | "pay_obligation";

export interface TxPresetValues {
  transactionType?: TransactionType;
  incomeSource?: FinanceTransaction["incomeSource"];
  amount?: number;
  description?: string;
  accountId?: string;
  pendingObligationId?: string;
  savingsGoalId?: string;
  toAccountId?: string;
}

export function FinanceDialog({
  mode,
  open,
  onOpenChange,
  txPreset = "default",
  presetValues,
  accounts,
  expenseCats,
  incomeCats,
  savingsGoals,
  pendingObligations,
  cyclePeriod,
  editingId,
  editTx,
  editSavings,
  editAccount,
  editBudget,
  editExpenseCat,
  editIncomeCat,
  onSubmitTx,
  onSubmitAccount,
  onSubmitBudget,
  onSubmitSavings,
  onSubmitExpenseCat,
  onSubmitIncomeCat,
  onSubmitRecurring,
}: {
  mode: FinanceDialogMode;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  txPreset?: TxPreset;
  presetValues?: TxPresetValues;
  accounts: FinanceAccount[];
  expenseCats: ExpenseCategory[];
  incomeCats: IncomeCategory[];
  savingsGoals: SavingsGoal[];
  pendingObligations: { id: string; name: string; expectedAmount: number }[];
  cyclePeriod?: { start: string; end: string };
  editingId?: string;
  editTx?: FinanceTransaction;
  editSavings?: SavingsGoal;
  editAccount?: FinanceAccount;
  editBudget?: Budget;
  editExpenseCat?: ExpenseCategory;
  editIncomeCat?: IncomeCategory;
  onSubmitTx: (d: Partial<FinanceTransaction>) => void;
  onSubmitAccount: (d: Partial<FinanceAccount>) => void;
  onSubmitBudget: (d: Partial<Budget>) => void;
  onSubmitSavings: (d: Partial<SavingsGoal>) => void;
  onSubmitExpenseCat: (d: Partial<ExpenseCategory>) => void;
  onSubmitIncomeCat: (d: Partial<IncomeCategory>) => void;
  onSubmitRecurring: (d: {
    name: string;
    amount: number;
    dueDayOfMonth: number;
    landlordReference?: string;
  }) => void;
}) {
  const savingsAccounts = useMemo(
    () => accounts.filter((a) => a.accountType === "savings"),
    [accounts],
  );
  const checkingAccounts = useMemo(
    () => accounts.filter((a) => a.accountType !== "savings"),
    [accounts],
  );

  const initialType =
    presetValues?.transactionType ??
    editTx?.transactionType ??
    (txPreset === "salary"
      ? "income"
      : txPreset === "savings_transfer"
        ? "transfer"
        : "expense");
  const initialSource =
    presetValues?.incomeSource ??
    editTx?.incomeSource ??
    (txPreset === "salary" ? "salary" : "freelance");

  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [incomeSource, setIncomeSource] =
    useState<FinanceTransaction["incomeSource"]>(initialSource);

  useEffect(() => {
    if (!open || mode !== "transaction") return;
    setTxType(initialType);
    setIncomeSource(initialSource);
  }, [open, mode, initialType, initialSource]);

  if (!mode) return null;

  const titles: Record<NonNullable<FinanceDialogMode>, string> = {
    transaction: editingId
      ? "Edit transaction"
      : txPreset === "salary"
        ? "Log salary"
        : txPreset === "savings_transfer"
          ? "Transfer to savings"
          : txPreset === "pay_obligation"
            ? "Pay obligation"
            : "Add transaction",
    account: editingId ? "Edit account" : "Add account",
    budget: editingId ? "Edit budget" : "Add sub-budget",
    savings: editingId ? "Edit savings goal" : "Add savings goal",
    "expense-cat": editingId ? "Edit expense category" : "Add expense category",
    "income-cat": editingId ? "Edit income category" : "Add income category",
    recurring: "Add recurring obligation",
  };

  const isSalary = txType === "income" && incomeSource === "salary";
  const isTransfer = txType === "transfer";
  const isExpense = txType === "expense";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            {mode === "transaction" && isTransfer
              ? "Transfers move money between accounts. Savings transfers require a goal and a savings account destination."
              : "Balances update automatically from transactions."}
          </DialogDescription>
        </DialogHeader>

        {mode === "transaction" && (
          <form
            key={`${txPreset}-${presetValues?.pendingObligationId ?? "new"}`}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const type = fd.get("transactionType") as TransactionType;
              const src = String(
                fd.get("incomeSource") ?? "",
              ) as FinanceTransaction["incomeSource"];
              const salary = type === "income" && src === "salary";
              const accountId = optionalUuid(fd.get("accountId"));
              if (!accountId) {
                toast.error("Select an account first");
                return;
              }
              const grossAmount = salary ? parseMoney(fd.get("grossAmount")) : undefined;
              const netAmount = salary ? parseMoney(fd.get("netAmount")) : undefined;
              const amount = salary
                ? (netAmount ?? grossAmount)
                : parseMoney(fd.get("amount"));
              if (amount === undefined || amount <= 0) {
                toast.error(salary ? "Enter gross and net salary amounts" : "Enter a valid amount");
                return;
              }
              if (type === "transfer" && !optionalUuid(fd.get("toAccountId"))) {
                toast.error("Select a destination account for the transfer");
                return;
              }
              if (
                txPreset === "savings_transfer" &&
                !optionalUuid(fd.get("savingsGoalId"))
              ) {
                toast.error("Select a savings goal for this transfer");
                return;
              }
              onSubmitTx({
                accountId,
                toAccountId: optionalUuid(fd.get("toAccountId")),
                transactionType: type,
                amount,
                grossAmount,
                taxDeducted: salary ? parseMoney(fd.get("taxDeducted")) ?? 0 : undefined,
                pensionDeducted: salary
                  ? parseMoney(fd.get("pensionDeducted")) ?? 0
                  : undefined,
                netAmount,
                pendingObligationId: optionalUuid(fd.get("pendingObligationId")),
                currency: String(fd.get("currency") ?? "ETB"),
                transactionDate: String(fd.get("transactionDate")),
                description:
                  String(fd.get("description") ?? "").trim() || undefined,
                categoryId: optionalUuid(fd.get("categoryId")),
                incomeSource: type === "income" ? src || undefined : undefined,
                paymentMethod: isExpense
                  ? (String(
                      fd.get("paymentMethod") ?? "",
                    ) as FinanceTransaction["paymentMethod"]) || undefined
                  : undefined,
                savingsGoalId: optionalUuid(fd.get("savingsGoalId")),
              });
            }}
          >
            <FormSelect
              label="From account"
              name="accountId"
              required
              defaultValue={
                editTx?.accountId ??
                presetValues?.accountId ??
                (presetValues?.transactionType === "transfer"
                  ? checkingAccounts[0]?.id
                  : checkingAccounts[0]?.id ?? accounts[0]?.id)
              }
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${a.accountType})`,
              }))}
            />

            {isTransfer && (
              <FormSelect
                label="To account"
                name="toAccountId"
                required
                defaultValue={
                  editTx?.toAccountId ??
                  presetValues?.toAccountId ??
                  savingsAccounts[0]?.id ??
                  ""
                }
                options={
                  txPreset === "savings_transfer" || presetValues?.savingsGoalId
                    ? savingsAccounts.map((a) => ({
                        value: a.id,
                        label: a.name,
                      }))
                    : [
                        { value: "", label: "Select account" },
                        ...accounts.map((a) => ({
                          value: a.id,
                          label: `${a.name} (${a.accountType})`,
                        })),
                      ]
                }
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Type"
                name="transactionType"
                defaultValue={initialType}
                options={TX_TYPES.map((t) => ({ value: t, label: t }))}
                onChange={(e) =>
                  setTxType(e.target.value as TransactionType)
                }
              />
              {!isSalary && (
                <FormField
                  label="Amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={
                    presetValues?.amount ?? editTx?.amount
                  }
                />
              )}
            </div>

            {txType === "income" && (
              <FormSelect
                label="Income source"
                name="incomeSource"
                defaultValue={initialSource}
                options={[
                  { value: "salary", label: "Salary (opens new cycle)" },
                  { value: "freelance", label: "Freelance" },
                  { value: "business", label: "Business" },
                  { value: "investment", label: "Investment" },
                  { value: "gift", label: "Gift" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(e) =>
                  setIncomeSource(
                    e.target.value as FinanceTransaction["incomeSource"],
                  )
                }
              />
            )}

            {isSalary && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="col-span-2 text-xs font-medium">
                  Salary breakdown
                </p>
                <FormField
                  label="Gross"
                  name="grossAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editTx?.grossAmount ?? presetValues?.amount}
                />
                <FormField
                  label="Tax deducted"
                  name="taxDeducted"
                  type="number"
                  step="0.01"
                  defaultValue={editTx?.taxDeducted ?? 0}
                />
                <FormField
                  label="Pension deducted"
                  name="pensionDeducted"
                  type="number"
                  step="0.01"
                  defaultValue={editTx?.pensionDeducted ?? 0}
                />
                <FormField
                  label="Net (take-home)"
                  name="netAmount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={
                    editTx?.netAmount ?? editTx?.amount ?? presetValues?.amount
                  }
                />
              </div>
            )}

            {isExpense && (
              <FormSelect
                label="Payment method"
                name="paymentMethod"
                defaultValue={editTx?.paymentMethod ?? "bank_transfer"}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "mobile", label: "Mobile" },
                  { value: "bank_transfer", label: "Bank transfer" },
                  { value: "other", label: "Other" },
                ]}
              />
            )}

            <FormField
              label="Date"
              name="transactionDate"
              type="date"
              required
              defaultValue={
                editTx?.transactionDate ?? format(new Date(), "yyyy-MM-dd")
              }
            />

            {isExpense && (
              <FormSelect
                label="Category"
                name="categoryId"
                defaultValue={editTx?.categoryId ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...expenseCats.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.classificationType ? ` (${c.classificationType.replace(/_/g, " ")})` : ""}`,
                  })),
                ]}
              />
            )}

            {txType === "income" && !isSalary && (
              <FormSelect
                label="Category"
                name="categoryId"
                defaultValue={editTx?.categoryId ?? ""}
                options={[
                  { value: "", label: "None" },
                  ...incomeCats.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            )}

            {(isExpense || txPreset === "pay_obligation") && (
              <FormSelect
                label="Link to pending obligation"
                name="pendingObligationId"
                defaultValue={
                  editTx?.pendingObligationId ??
                  presetValues?.pendingObligationId ??
                  ""
                }
                options={[
                  { value: "", label: "None" },
                  ...pendingObligations.map((o) => ({
                    value: o.id,
                    label: `${o.name} — ${o.expectedAmount}`,
                  })),
                ]}
              />
            )}

            {isTransfer && (
              <FormSelect
                label="Savings goal"
                name="savingsGoalId"
                required={txPreset === "savings_transfer"}
                defaultValue={
                  editTx?.savingsGoalId ?? presetValues?.savingsGoalId ?? ""
                }
                options={[
                  { value: "", label: "Select goal" },
                  ...savingsGoals.map((g) => ({ value: g.id, label: g.name })),
                ]}
              />
            )}

            <FormField
              label="Description"
              name="description"
              defaultValue={
                editTx?.description ?? presetValues?.description
              }
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
            <FormField label="Name" name="name" required defaultValue={editAccount?.name} />
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
            <p className="text-xs text-muted-foreground rounded border p-2">
              Sub-budgets live inside your cycle spending budget. Only variable
              and discretionary expenses count toward budget spent.
            </p>
            <FormField label="Budget name" name="name" required defaultValue={editBudget?.name} />
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
                defaultValue={editBudget?.periodStart ?? cyclePeriod?.start}
              />
              <FormField
                label="Period end"
                name="periodEnd"
                type="date"
                required
                defaultValue={editBudget?.periodEnd ?? cyclePeriod?.end}
              />
            </div>
            <FormSelect
              label="Expense category (optional)"
              name="categoryId"
              defaultValue={editBudget?.categoryId ?? ""}
              options={[
                { value: "", label: "All variable expenses" },
                ...expenseCats
                  .filter(
                    (c) =>
                      c.classificationType !== "fixed_obligation" &&
                      c.classificationType !== "savings_transfer",
                  )
                  .map((c) => ({ value: c.id, label: c.name })),
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
                monthlyTargetAmount:
                  Number(fd.get("monthlyTargetAmount") ?? 0) || undefined,
                targetDate: String(fd.get("targetDate") ?? "") || undefined,
              });
            }}
          >
            <FormField label="Goal name" name="name" required defaultValue={editSavings?.name} />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Target amount"
                name="targetAmount"
                type="number"
                step="0.01"
                required
                defaultValue={editSavings?.targetAmount}
              />
              <FormField
                label="Monthly commitment"
                name="monthlyTargetAmount"
                type="number"
                step="0.01"
                defaultValue={editSavings?.monthlyTargetAmount}
              />
            </div>
            {editSavings && (
              <p className="text-xs text-muted-foreground">
                Saved: {editSavings.currentAmount} (from transfers only)
                {editSavings.projectedCompletionDate &&
                  ` · On track for ${editSavings.projectedCompletionDate}`}
              </p>
            )}
            <FormField
              label="Target date (optional)"
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
                classificationType: String(
                  fd.get("classificationType") ?? "",
                ) as ExpenseCategory["classificationType"],
                dueDay: Number(fd.get("dueDay") ?? "") || undefined,
                expectedAmount:
                  Number(fd.get("expectedAmount") ?? "") || undefined,
              });
            }}
          >
            <FormField
              label="Category name"
              name="name"
              required
              defaultValue={editExpenseCat?.name}
            />
            <FormSelect
              label="Classification"
              name="classificationType"
              defaultValue={editExpenseCat?.classificationType ?? "discretionary"}
              options={[
                { value: "fixed_obligation", label: "Fixed obligation (rent, bills)" },
                { value: "variable_necessity", label: "Variable necessity (food, transport)" },
                { value: "discretionary", label: "Discretionary (entertainment)" },
                { value: "savings_transfer", label: "Savings transfer" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Due day (fixed only)"
                name="dueDay"
                type="number"
                min="1"
                max="31"
                defaultValue={editExpenseCat?.dueDay}
              />
              <FormField
                label="Expected amount"
                name="expectedAmount"
                type="number"
                step="0.01"
                defaultValue={editExpenseCat?.expectedAmount}
              />
            </div>
            <FormField
              label="Color (hex)"
              name="color"
              placeholder="#ef4444"
              defaultValue={editExpenseCat?.color}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}

        {mode === "recurring" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmitRecurring({
                name: String(fd.get("name")),
                amount: Number(fd.get("amount")),
                dueDayOfMonth: Number(fd.get("dueDayOfMonth")),
                landlordReference:
                  String(fd.get("landlordReference") ?? "").trim() || undefined,
              });
            }}
          >
            <FormField label="Name (e.g. Rent)" name="name" required />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Amount" name="amount" type="number" step="0.01" required />
              <FormField label="Due day" name="dueDayOfMonth" type="number" min="1" max="31" required />
            </div>
            <FormField label="Reference / note" name="landlordReference" />
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
            <FormField
              label="Category name"
              name="name"
              required
              defaultValue={editIncomeCat?.name}
            />
            <FormField
              label="Color (hex)"
              name="color"
              placeholder="#22c55e"
              defaultValue={editIncomeCat?.color}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
