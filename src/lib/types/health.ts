import type { BaseEntity } from "./common";

export type HealthMetricType =
  | "weight"
  | "exercise"
  | "sleep"
  | "water"
  | "steps"
  | "workout";

export interface HealthLog extends BaseEntity {
  metricType: HealthMetricType;
  logDate: string;
  value: number;
  unit?: string;
  notes?: string;
}
