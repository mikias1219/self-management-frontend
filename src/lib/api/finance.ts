import { apiClient } from "./client";
import { createCrudApi } from "./crud";
import type {
  Budget,
  CycleAllocation,
  CycleDetail,
  ExpenseCategory,
  FinanceAccount,
  FinanceCycle,
  FinanceSummary,
  FinanceTransaction,
  IncomeCategory,
  RecurringObligation,
  SavingsGoal,
} from "@/lib/types";
import type { DateRangeQuery, PaginatedResponse } from "@/lib/types";

export const financeApi = {
  accounts: createCrudApi<FinanceAccount>("/finance/accounts"),
  transactions: {
    ...createCrudApi<FinanceTransaction>("/finance/transactions"),
    getAll: (params?: DateRangeQuery) =>
      apiClient
        .get<PaginatedResponse<FinanceTransaction>>("/finance/transactions", {
          params: { page: 1, limit: 20, ...params },
        })
        .then((r) => r.data),
    createSimple: (data: {
      amount: number;
      transactionType: string;
      categoryId?: string;
      description?: string;
      transactionDate?: string;
      accountId?: string;
    }) =>
      apiClient
        .post<FinanceTransaction>("/finance/transactions/simple", data)
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
    getOne: (id: string) =>
      apiClient.get<FinanceCycle>(`/finance/cycles/${id}`).then((r) => r.data),
    getDetail: (id: string) =>
      apiClient
        .get<CycleDetail>(`/finance/cycles/${id}/detail`)
        .then((r) => r.data),
    getCurrent: () =>
      apiClient
        .get<FinanceCycle | null>("/finance/cycles/current")
        .then((r) => r.data),
    updateAllocation: (data: CycleAllocation) =>
      apiClient
        .patch<FinanceCycle>("/finance/cycles/current/allocation", data)
        .then((r) => r.data),
    markObligationPaid: (obligationId: string, transactionId: string) =>
      apiClient
        .patch(`/finance/cycles/obligations/${obligationId}/pay`, {
          transactionId,
        })
        .then((r) => r.data),
  },
  getSummary: (params?: DateRangeQuery) =>
    apiClient
      .get<FinanceSummary>("/finance/summary", { params })
      .then((r) => r.data),

  getMonthSummary: (month?: string) =>
    apiClient
      .get("/finance/month-summary", { params: month ? { month } : undefined })
      .then((r) => r.data),

  getUpcomingBills: (days = 7) =>
    apiClient
      .get("/finance/upcoming-bills", { params: { days } })
      .then((r) => r.data),
};
