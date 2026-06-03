"use client";

import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePeriod } from "@/hooks/use-period";
import type { AnalyticsPeriod } from "@/lib/types";

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

export function PeriodFilter({ className }: { className?: string }) {
  const { period, setPeriod, setCustomRange } = usePeriod();

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          variant={period === p.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPeriod(p.value)}
          className="h-7 px-2.5 text-xs"
        >
          {p.label}
        </Button>
      ))}
      {period === "custom" && (
        <Popover>
          <PopoverTrigger
            nativeButton={false}
            render={
              <Button variant="outline" size="sm" className="h-7 gap-1.5">
                <CalendarRange className="size-3.5" />
                Range
              </Button>
            }
          />
          <PopoverContent className="w-72" align="end">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const start = fd.get("start") as string;
                const end = fd.get("end") as string;
                if (start && end) {
                  setCustomRange(new Date(start), new Date(end));
                }
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="period-start">Start</Label>
                <Input
                  id="period-start"
                  name="start"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="period-end">End</Label>
                <Input
                  id="period-end"
                  name="end"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <Button type="submit" size="sm" className="w-full">
                Apply
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
