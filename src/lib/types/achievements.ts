export type AchievementStatus =
  | "not_started"
  | "ongoing"
  | "finished"
  | "achieved";

export interface AchievementHighlight {
  id: string;
  title: string;
  status: AchievementStatus;
  finishedAt?: string;
  detail?: string;
}

export interface ModuleAchievementStats {
  module: string;
  label: string;
  href: string;
  ongoing: number;
  finished: number;
  achieved: number;
  notStarted: number;
  total: number;
  completionRate: number;
  planned?: PlannedVsAchieved;
  highlights: AchievementHighlight[];
}

export interface AchievementReport {
  id: string;
  module: string;
  moduleLabel: string;
  title: string;
  status: AchievementStatus;
  finishedAt: string;
  description?: string;
}

export interface PlannedVsAchieved {
  plannedCount: number;
  achievedCount: number;
  missedCount: number;
  ongoingCount: number;
  plannedMinutes: number;
  achievedMinutes: number;
  fulfillmentRate: number;
}

export interface AchievementsSnapshot {
  period: string;
  range: { start: string; end: string };
  plannedVsAchieved: PlannedVsAchieved;
  overall: {
    score: number;
    ongoing: number;
    finished: number;
    achieved: number;
    notStarted: number;
    completionRate: number;
    modulesTracked: number;
    activityScore?: number;
  };
  modules: ModuleAchievementStats[];
  reports: AchievementReport[];
}
