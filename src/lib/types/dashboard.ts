import type { Task } from "./task";

export interface PosDashboardOverview {
  todayFocus: {
    tasks: {
      id: string;
      title: string;
      priority: string;
      lifeArea: string | null;
      status: string;
      dueDate: string | null;
      estimatedMinutes: number | null;
    }[];
    spendingToday: number;
    habitsCompletionRate: number;
    studyMinutes: number;
  };
  financialSnapshot: {
    currency: string;
    monthlyIncome: number;
    monthlyExpense: number;
    netBalance: number;
    savingsRate: number;
    burnRate: number;
    forecastEndOfMonthNet: number;
  };
  taskStatus: {
    pending: number;
    inProgress: number;
    overdue: number;
    completedThisWeek: number;
    completionRate: number;
    productivityScore: number;
  };
  aiInsight: string;
  dailySummary: string;
  scores: {
    productivityScore: number;
    financialHealthScore: number;
  };
  recentTasks: Task[];
  intelligence: {
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
  };
}

/** @deprecated Use PosDashboardOverview */
export type DashboardOverview = PosDashboardOverview;
