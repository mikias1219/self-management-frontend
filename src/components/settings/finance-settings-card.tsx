"use client";

import { Calendar, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsApi } from "@/lib/api";
import { useStandData, useStandMutation } from "@/hooks/use-stand-data";

export function FinanceSettingsCard({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useStandData(
    ["settings"],
    () => settingsApi.get(),
    { enabled },
  );

  const mutation = useStandMutation(settingsApi.update, {
    invalidateKeys: [["settings"]],
    onSuccess: () => toast.success("Finance settings saved"),
    onError: () => toast.error("Could not save finance settings"),
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="size-4 text-emerald-600" />
          Finance cycle
        </CardTitle>
        <CardDescription>
          Your salary day defines each financial month: from salary day until the
          day before next month&apos;s salary day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            key={String(data?.salaryDay ?? 25)}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const salaryDay = Number(fd.get("salaryDay"));
              if (salaryDay < 1 || salaryDay > 31) {
                toast.error("Salary day must be between 1 and 31");
                return;
              }
              void mutation.mutate({ salaryDay });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="salaryDay" className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Salary day of month
              </Label>
              <Input
                id="salaryDay"
                name="salaryDay"
                type="number"
                min={1}
                max={31}
                required
                defaultValue={data?.salaryDay ?? 25}
              />
              <p className="text-xs text-muted-foreground">
                Example: if you are paid on the 25th, set 25. Logging salary
                income opens a new cycle automatically.
              </p>
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save finance settings"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
