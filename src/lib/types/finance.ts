import type { BaseEntity, DateRangeQuery } from "./common";

export type AccountType =
  | "checking"
  | "savings"
  | "credit"
  | "cash"
  | "investment";
export type TransactionType = "income" | "expense" | "transfer";

export interface FinanceAccount extends BaseEntity {
  name: string;
  accountType: AccountType;
  balance: number;
  currency: string;
}

export type IncomeSource =
  | "salary"
  | "freelance"
  | "business"
  | "investment"
  | "gift"
  | "other";

export type PaymentMethod =
  | "cash"
  | "card"
  | "mobile"
  | "bank_transfer"
  | "other";

export type RecurringInterval = "none" | "weekly" | "monthly" | "yearly";

export interface FinanceTransaction extends BaseEntity {
  accountId: string;
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  transactionDate: string;
  description?: string;
  categoryId?: string;
  incomeSource?: IncomeSource;
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  linkedTaskId?: string;
}

export interface Budget extends BaseEntity {
  name: string;
  amount: number;
  spent: number;
  periodStart: string;
  periodEnd: string;
  categoryId?: string;
}

export interface SavingsGoal extends BaseEntity {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface IncomeCategory extends BaseEntity {
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseCategory extends BaseEntity {
  name: string;
  icon?: string;
  color?: string;
}

export interface FinanceSummaryBudget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  periodStart: string;
  periodEnd: string;
  categoryId?: string;
}

export interface FinanceSummarySavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  progressPercent: number;
  targetDate?: string;
}

export interface FinanceSummary {
  period: DateRangeQuery;
  range: { start: string; end: string };
  totals: {
    netWorth: number;
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    netCashFlow: number;
    savingsRate: number;
    totalSavingsTarget: number;
    totalSavingsCurrent: number;
    accountCount: number;
    transactionCount: number;
    burnRate?: number;
    forecastEndOfMonthExpense?: number;
    forecastEndOfMonthNet?: number;
  };
  budgets: FinanceSummaryBudget[];
  savingsGoals: FinanceSummarySavingsGoal[];
  expenseByCategory: { categoryId: string; name: string; amount: number }[];
  incomeByCategory: { categoryId: string; name: string; amount: number }[];
  dailyCashFlow: {
    date: string;
    income: number;
    expense: number;
    net: number;
  }[];
}
