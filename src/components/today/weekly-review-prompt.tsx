"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WeeklyReviewPrompt() {
  const isSunday = new Date().getDay() === 0;
  if (!isSunday) return null;

  return (
    <Card className="border-violet-500/30 bg-violet-500/5">
      <CardHeader>
        <CardTitle className="text-base">Weekly review — 5 minutes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Update milestone progress and plan next week&apos;s targets.
        </p>
        <Button size="sm" asChild>
          <Link href="/productivity?tab=goals">Start review</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
