import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type {
  Budget,
  CycleAllocation,
  ExpenseCategory,
  FinanceAccount,
  FinanceCycle,
  FinanceSummary,
  FinanceTransaction,
  IncomeCategory,
  RecurringObligation,
  SavingsGoal,
} from "@/lib/types";
import type { DateRangeQuery } from "@/lib/types";

export const financeApi = {
  accounts: createCrudApi<FinanceAccount>("/finance/accounts"),
  transactions: {
    ...createCrudApi<FinanceTransaction>("/finance/transactions"),
    getAll: (params?: DateRangeQuery) =>
      apiClient
        .get<FinanceTransaction[]>("/finance/transactions", { params })
        .then((r) => r.data),
  },
  budgets: createCrudApi<Budget>("/finance/budgets"),
  savingsGoals: createCrudApi<SavingsGoal>("/finance/savings-goals"),
  recurringObligations: createCrudApi<RecurringObligation>(
    "/finance/recurring-obligations",
  ),
  incomeCategories: createCrudApi<IncomeCategory>(
    "/finance/income-categories",
  ),
  expenseCategories: createCrudApi<ExpenseCategory>(
    "/finance/expense-categories",
  ),
  cycles: {
    getAll: () =>
      apiClient.get<FinanceCycle[]>("/finance/cycles").then((r) => r.data),
    getCurrent: () =>
      apiClient
        .get<FinanceCycle | null>("/finance/cycles/current")
        .then((r) => r.data),
    updateAllocation: (data: CycleAllocation) =>
      apiClient
        .patch<FinanceCycle>("/finance/cycles/current/allocation", data)
        .then((r) => r.data),
  },
  getSummary: (params?: DateRangeQuery) =>
    apiClient
      .get<FinanceSummary>("/finance/summary", { params })
      .then((r) => r.data),
};
