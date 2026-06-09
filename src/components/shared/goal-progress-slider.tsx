"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useStandMutation } from "@/hooks/use-stand-data";
import { goalsApi } from "@/lib/api";
import { toast } from "sonner";

interface GoalProgressSliderProps {
  goalId: string;
  initialProgress: number;
  label?: string;
}

export function GoalProgressSlider({
  goalId,
  initialProgress,
  label = "Progress",
}: GoalProgressSliderProps) {
  const [value, setValue] = useState(initialProgress);

  const update = useStandMutation(
    (progress: number) => goalsApi.updateProgress(goalId, progress),
    {
      invalidateKeys: [["goals"], ["productivity", "today-summary"]],
      onSuccess: () => toast.success("Progress updated"),
    },
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        className="w-full"
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={() => update.mutate(value)}
        onTouchEnd={() => update.mutate(value)}
      />
    </div>
  );
}
