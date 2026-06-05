import type { BaseEntity, DateRangeQuery } from "./common";

export type AccountType =
  | "checking"
  | "savings"
  | "credit"
  | "cash"
  | "investment";
export type TransactionType = "income" | "expense" | "transfer";
export type FinanceCycleStatus = "open" | "closed";
export type PendingObligationStatus = "pending" | "paid" | "overdue";

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
  toAccountId?: string;
  transactionType: TransactionType;
  amount: number;
  grossAmount?: number;
  taxDeducted?: number;
  pensionDeducted?: number;
  netAmount?: number;
  needsReview?: boolean;
  isCorrection?: boolean;
  correctionReason?: string;
  pendingObligationId?: string;
  cycleId?: string;
  currency?: string;
  transactionDate: string;
  description?: string;
  categoryId?: string;
  incomeSource?: IncomeSource;
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  linkedTaskId?: string;
  savingsGoalId?: string;
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
  monthlyTargetAmount?: number;
  savingsShortfallCarryForward?: number;
  projectedCompletionDate?: string;
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
  classificationType?:
    | "fixed_obligation"
    | "variable_necessity"
    | "discretionary"
    | "savings_transfer";
  dueDay?: number;
  expectedAmount?: number;
}

export interface RecurringObligation extends BaseEntity {
  name: string;
  amount: number;
  dueDayOfMonth: number;
  paymentMethod?: PaymentMethod;
  landlordReference?: string;
  isActive: boolean;
}

export interface FinanceCycle extends Omit<BaseEntity, "status"> {
  startDate: string;
  endDate: string;
  cycleStatus: FinanceCycleStatus;
  grossSalary: number;
  netSalary: number;
  fixedObligations: number;
  savingsTarget: number;
  spendingBudget: number;
  totalFixedObligations: number;
  totalSavingsAllocated: number;
  totalVariableSpent: number;
  remainingBalance: number;
  savingsShortfall: number;
  actualSavingsRate?: number;
  fixedObligationRate?: number;
  discretionaryRate?: number;
  largestExpenseCategory?: string;
  unspentBudget?: number;
  financialHealthScore?: number;
  closedAt?: string;
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
  monthlyTargetAmount?: number;
  savingsShortfallCarryForward?: number;
  remaining: number;
  progressPercent: number;
  targetDate?: string;
  projectedCompletionDate?: string;
}

export interface FinanceSummaryObligation {
  id: string;
  name: string;
  expectedAmount: number;
  dueDate: string;
  status: PendingObligationStatus;
}

export interface FinanceSummaryCycle {
  id: string;
  startDate: string;
  endDate: string;
  status: FinanceCycleStatus;
  grossSalary: number;
  netSalary: number;
  fixedObligations: number;
  savingsTarget: number;
  spendingBudget: number;
  totalFixedObligations: number;
  totalSavingsAllocated: number;
  totalVariableSpent: number;
  remainingBalance: number;
  savingsShortfall: number;
  financialHealthScore: number;
  remainingUnallocated: number;
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
  currentCycle: FinanceSummaryCycle | null;
  obligations: {
    upcoming: FinanceSummaryObligation[];
    overdue: FinanceSummaryObligation[];
    paidThisCycle: FinanceSummaryObligation[];
  };
  expenseByCategory: { categoryId: string; name: string; amount: number }[];
  incomeByCategory: { categoryId: string; name: string; amount: number }[];
  dailyCashFlow: {
    date: string;
    income: number;
    expense: number;
    net: number;
  }[];
}

export interface CycleAllocation {
  fixedObligations: number;
  savingsTarget: number;
  spendingBudget: number;
}
