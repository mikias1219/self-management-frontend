"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeos-onboarding-dismissed";

const STEPS = [
  { id: "habit", label: "Add your first habit", href: "/productivity?tab=habits" },
  { id: "budget", label: "Set up your budget", href: "/finance?tab=budget" },
  { id: "calendar", label: "Connect Google Calendar", href: "/settings" },
  { id: "task", label: "Create a task for today", href: "/productivity?tab=tasks" },
] as const;

interface OnboardingChecklistProps {
  hasHabits?: boolean;
  hasBudget?: boolean;
  hasCalendar?: boolean;
  hasTasks?: boolean;
}

export function OnboardingChecklist({
  hasHabits,
  hasBudget,
  hasCalendar,
  hasTasks,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const done: Record<string, boolean> = {
    habit: !!hasHabits,
    budget: !!hasBudget,
    calendar: !!hasCalendar,
    task: !!hasTasks,
  };

  const completed = STEPS.filter((s) => done[s.id]).length;
  if (dismissed || completed === STEPS.length) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Get started with LifeOS</CardTitle>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
          aria-label="Dismiss onboarding"
        >
          <X className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {completed} of {STEPS.length} complete
        </p>
        <ul className="space-y-1.5">
          {STEPS.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-background/60",
                  done[step.id] && "text-muted-foreground line-through",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[10px]",
                    done[step.id]
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                      : "border-muted-foreground/30",
                  )}
                >
                  {done[step.id] ? <Check className="size-3" /> : null}
                </span>
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
