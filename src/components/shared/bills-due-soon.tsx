"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/period";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  name: string;
  dueDate: string;
  expectedAmount: number;
  status?: string;
}

interface BillsDueSoonProps {
  bills: Bill[];
  currency?: string;
}

function urgencyClass(dueDate: string, status?: string) {
  if (status === "overdue") return "border-destructive/50 bg-destructive/5";
  const today = new Date().toISOString().slice(0, 10);
  const diff =
    (new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000;
  if (diff <= 0) return "border-destructive/50 bg-destructive/5";
  if (diff <= 2) return "border-amber-500/50 bg-amber-500/5";
  return "";
}

export function BillsDueSoon({ bills, currency = "ETB" }: BillsDueSoonProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Bills due soon</CardTitle>
        <Link href="/finance?tab=budget" className="text-xs text-primary underline">
          Finance
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bills due in the next few days.</p>
        ) : (
          bills.map((b) => (
            <div
              key={b.id}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                urgencyClass(b.dueDate, b.status),
              )}
            >
              <div>
                <p className="font-medium flex items-center gap-2">
                  {b.name}
                  {b.status === "overdue" && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </p>
                <p className="text-muted-foreground">Due {b.dueDate}</p>
              </div>
              <span className="tabular-nums font-medium">
                {formatMoney(b.expectedAmount, currency)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
