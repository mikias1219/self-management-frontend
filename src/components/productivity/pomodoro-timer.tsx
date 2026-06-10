"use client";

import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (!onBreak) {
            setOnBreak(true);
            return BREAK_SECONDS;
          }
          setOnBreak(false);
          return WORK_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, onBreak]);

  const reset = useCallback(() => {
    setRunning(false);
    setOnBreak(false);
    setSeconds(WORK_SECONDS);
  }, []);

  if (!open) {
    return (
      <Button
        size="icon-sm"
        variant="outline"
        className="fixed bottom-20 right-4 z-30 size-11 rounded-full shadow-lg md:bottom-6"
        onClick={() => setOpen(true)}
        aria-label="Open focus timer"
      >
        <Timer className="size-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 z-30 w-56 shadow-lg md:bottom-6">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            {onBreak ? "Break" : "Focus"}
          </p>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setOpen(false)}
            aria-label="Close timer"
          >
            ×
          </Button>
        </div>
        <p
          className={cn(
            "text-center text-3xl font-semibold tabular-nums",
            onBreak ? "text-emerald-600" : "text-primary",
          )}
        >
          {formatTime(seconds)}
        </p>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={running ? "secondary" : "default"}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
