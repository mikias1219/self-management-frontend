"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandData } from "@/hooks/use-stand-data";
import { aiCoachApi } from "@/lib/api/ai-coach";

interface AIInsightCardProps {
  moduleKey: string;
}

export function AIInsightCard({ moduleKey }: AIInsightCardProps) {
  const dismissKey = `ai-insight-dismissed:${moduleKey}:${new Date().toISOString().slice(0, 10)}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  const { data, isLoading } = useStandData(
    ["ai-coach", "module-insight", moduleKey],
    () => aiCoachApi.getModuleInsight(moduleKey),
    { staleTime: 4 * 60 * 60 * 1000 },
  );

  if (dismissed) return null;

  return (
    <Card className="border-indigo-500/30 bg-indigo-500/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-indigo-600" />
        <div className="min-w-0 flex-1 text-sm">
          {isLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <p>{data?.insight ?? "Loading insight…"}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => {
            localStorage.setItem(dismissKey, "1");
            setDismissed(true);
          }}
        >
          <X className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
