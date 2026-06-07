"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/api/settings";
import { useStandMutation } from "@/hooks/use-stand-data";
import type { FinanceDialogMode } from "@/components/finance/finance-dialog";

interface FinanceOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salaryDay: number;
  onOpenDialog: (mode: FinanceDialogMode) => void;
  onGoToCycle: () => void;
}

const STEPS = [
  { title: "Create accounts", desc: "Add a checking and savings account." },
  { title: "Log first salary", desc: "Salary opens your finance cycle." },
  { title: "Set cycle allocation", desc: "Split fixed, savings, and spending." },
  { title: "Add recurring bills", desc: "Rent, utilities, subscriptions." },
  { title: "Create budgets", desc: "Envelope budgets within spending." },
] as const;

export function FinanceOnboardingWizard({
  open,
  onOpenChange,
  salaryDay,
  onOpenDialog,
  onGoToCycle,
}: FinanceOnboardingWizardProps) {
  const [step, setStep] = useState(0);

  const complete = useStandMutation(
    () =>
      settingsApi.update({
        financeOnboardingCompleted: true,
      }),
    {
      invalidateKeys: [["settings"], ["finance", "summary"]],
      onSuccess: () => onOpenChange(false),
    },
  );

  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finance setup — step {step + 1} of {STEPS.length}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Salary day: {salaryDay} of each month
          </p>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p className="font-medium">{current.title}</p>
          <p className="text-sm text-muted-foreground">{current.desc}</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (step === 0) {
                onOpenDialog("account");
                setStep(1);
              } else if (step === 1) {
                onOpenDialog("transaction");
                setStep(2);
              } else if (step === 2) {
                onGoToCycle();
                setStep(3);
              } else if (step === 3) {
                onOpenDialog("recurring");
                setStep(4);
              } else if (step === 4) {
                onOpenDialog("budget");
                complete.mutate(undefined);
              }
            }}
          >
            {step === STEPS.length - 1 ? "Finish setup" : "Continue"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => complete.mutate(undefined)}
          >
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
