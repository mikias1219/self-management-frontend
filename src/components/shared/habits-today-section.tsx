"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStandMutation } from "@/hooks/use-stand-data";
import { habitsApi } from "@/lib/api";
import { toast } from "sonner";

interface HabitToday {
  id: string;
  name: string;
  currentStreak: number;
  logged: boolean;
}

interface HabitsTodaySectionProps {
  habits: HabitToday[];
}

export function HabitsTodaySection({ habits }: HabitsTodaySectionProps) {
  const checkIn = useStandMutation(
    (habitId: string) =>
      habitsApi.createLog(habitId, { completedAt: new Date().toISOString() }),
    {
      invalidateKeys: [["productivity", "today-summary"], ["habits"]],
      onSuccess: () => toast.success("Habit logged"),
    },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Habits due today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habits scheduled today.</p>
        ) : (
          habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={h.logged ? "line-through text-muted-foreground" : ""}>
                  {h.name}
                </span>
                {h.currentStreak > 0 && (
                  <Badge variant="secondary">{h.currentStreak} day streak</Badge>
                )}
              </div>
              {!h.logged && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => checkIn.mutate(h.id)}
                  disabled={checkIn.isPending}
                >
                  Done
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
