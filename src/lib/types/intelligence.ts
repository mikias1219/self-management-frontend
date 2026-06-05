import type { LifeArea } from "./life-area";

export interface LifeIntelligenceScores {
  productivityScore: number;
  financialHealthScore: number;
}

export interface FinanceIntelligence {
  currency: string;
  monthly: {
    income: number;
    expense: number;
    netBalance: number;
    savingsRate: number;
  };
  weekly: {
    income: number;
    expense: number;
    netBalance: number;
  };
  burnRate: number;
  forecast: {
    endOfMonthExpense: number;
    endOfMonthNet: number;
    daysRemaining: number;
  };
  spendingByCategory: {
    categoryId: string;
    name: string;
    amount: number;
    percentOfExpense: number;
  }[];
  topOverspendCategory: string | null;
  accountBalance: number;
  transactionCount: number;
}

export interface TaskIntelligence {
  focusToday: {
    id: string;
    title: string;
    priority: string;
    lifeArea: LifeArea | null;
    status: string;
    dueDate: string | null;
    estimatedMinutes: number | null;
  }[];
  overdue: {
    id: string;
    title: string;
    dueDate: string | null;
    lifeArea: LifeArea | null;
    daysOverdue: number;
  }[];
  metrics: {
    openCount: number;
    overdueCount: number;
    completionRate: number;
    overdueRatio: number;
    productivityScore: number;
    dailyVelocity: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
  weeklyCompletionTrend: { day: string; completed: number }[];
  byLifeArea: { lifeArea: string; open: number; overdue: number }[];
}

export interface UnifiedIntelligence {
  generatedAt: string;
  meta: {
    today: string;
    currency: string;
    weekRange: { start: string; end: string };
    monthRange: { start: string; end: string };
  };
  scores: LifeIntelligenceScores;
  dailySummary: string;
  weeklyPerformance: {
    tasksCompleted: number;
    weeklyNet: number;
    weeklyExpense: number;
    productivityScore: number;
    financialHealthScore: number;
  };
  monthlyTrend: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
    taskCompletionRate: number;
    forecastEndOfMonthNet: number;
  };
  finance: FinanceIntelligence;
  tasks: TaskIntelligence;
  goals: {
    id: string;
    title: string;
    progress: number;
    lifeArea: LifeArea | null;
    targetDate: string | null;
  }[];
  habits: {
    total: number;
    loggedToday: number;
    completionRateToday: number;
  };
  learning: {
    studyMinutesToday: number;
    sessionsToday: number;
  };
  aiInsight: string;
}
