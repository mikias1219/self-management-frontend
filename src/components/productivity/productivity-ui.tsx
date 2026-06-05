"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Segmented control for Remaining / Done etc. */
export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-muted/80 p-1 gap-0.5",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            value === opt.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
          {opt.count !== undefined && opt.count > 0 ? (
            <span
              className={cn(
                "ml-1.5 tabular-nums text-xs",
                value === opt.id ? "text-primary" : "text-muted-foreground",
              )}
            >
              {opt.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function PeriodPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
      {options.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            value === p.value
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "sky",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: "sky" | "violet" | "amber" | "emerald";
  className?: string;
}) {
  const accentMap = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            accentMap[accent],
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 88,
  stroke = 6,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      className={cn("-rotate-90", className)}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-muted/80"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-primary"
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
