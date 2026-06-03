import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProgressItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

interface ProgressWidgetProps {
  title: string;
  items: ProgressItem[];
  loading?: boolean;
  className?: string;
}

export function ProgressWidget({
  title,
  items,
  loading,
  className,
}: ProgressWidgetProps) {
  if (loading) {
    return (
      <Card className={cn("border shadow-sm", className)}>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const max = item.max ?? 100;
          const pct = Math.min(100, Math.round((item.value / max) * 100));
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
