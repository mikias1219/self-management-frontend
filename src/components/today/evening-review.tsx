"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormTextarea } from "@/components/shared/form-fields";
import { useStandMutation } from "@/hooks/use-stand-data";
import { dailyReviewsApi } from "@/lib/api/daily-reviews";
import { format } from "date-fns";

interface EveningReviewProps {
  reviewExists: boolean;
  stats?: {
    tasksDone?: number;
    habitsLogged?: number;
  };
}

export function EveningReview({ reviewExists, stats }: EveningReviewProps) {
  const hour = new Date().getHours();
  const [open, setOpen] = useState(!reviewExists);
  if (hour < 18) return null;

  const save = useStandMutation(
    (data: {
      reviewDate: string;
      moodScore: number;
      wins?: string;
      challenges?: string;
      reviewType?: string;
    }) => dailyReviewsApi.upsertToday(data),
    {
      invalidateKeys: [["productivity", "today-summary"], ["daily-reviews"]],
      onSuccess: () => {
        toast.success("Evening review saved");
        setOpen(false);
      },
    },
  );

  if (!open && reviewExists) {
    return (
      <Card id="review">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Evening review completed.{" "}
          <Button variant="link" className="h-auto p-0" onClick={() => setOpen(true)}>
            Edit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="review">
      <CardHeader>
        <CardTitle className="text-base">Evening review</CardTitle>
        {stats && (
          <p className="text-sm text-muted-foreground">
            Today: {stats.tasksDone ?? 0} tasks done, {stats.habitsLogged ?? 0} habits logged
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save.mutate({
              reviewDate: format(new Date(), "yyyy-MM-dd"),
              moodScore: Number(fd.get("moodScore") || 3),
              wins: String(fd.get("wins") || "").trim() || undefined,
              challenges: String(fd.get("challenges") || "").trim() || undefined,
              reviewType: "daily",
            });
          }}
        >
          <FormField
            label="Mood (1–5)"
            name="moodScore"
            type="number"
            min={1}
            max={5}
            defaultValue="3"
            required
          />
          <FormTextarea label="What went well?" name="wins" rows={2} />
          <FormTextarea label="What to improve tomorrow?" name="challenges" rows={2} />
          <Button type="submit" disabled={save.isPending}>
            Save review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
