import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type {
  Budget,
  ExpenseCategory,
  FinanceAccount,
  FinanceSummary,
  FinanceTransaction,
  IncomeCategory,
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
  incomeCategories: createCrudApi<IncomeCategory>(
    "/finance/income-categories",
  ),
  expenseCategories: createCrudApi<ExpenseCategory>(
    "/finance/expense-categories",
  ),
  getSummary: (params?: DateRangeQuery) =>
    apiClient
      .get<FinanceSummary>("/finance/summary", { params })
      .then((r) => r.data),
};
