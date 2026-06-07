"use client";

import { formatMoney, formatPercent } from "@/lib/utils/period";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useStandData } from "@/hooks/use-stand-data";
import { financeApi } from "@/lib/api/finance";
import { hasAuthToken } from "@/lib/api/client";
import type { CycleDetail } from "@/lib/types/finance";
import { Skeleton } from "@/components/ui/skeleton";

interface CycleDetailSheetProps {
  cycleId: string | null;
  onClose: () => void;
  currency?: string;
}

export function CycleDetailSheet({
  cycleId,
  onClose,
  currency = "ETB",
}: CycleDetailSheetProps) {
  const authenticated = hasAuthToken();
  const { data, isLoading } = useStandData(
    ["finance", "cycle-detail", cycleId ?? ""],
    () => financeApi.cycles.getDetail(cycleId!),
    { enabled: authenticated && !!cycleId },
  );

  const detail = data as CycleDetail | undefined;

  return (
    <Sheet open={!!cycleId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cycle detail</SheetTitle>
        </SheetHeader>
        {isLoading || !detail ? (
          <Skeleton className="mt-4 h-48 w-full" />
        ) : (
          <div className="mt-4 space-y-6 text-sm">
            <div>
              <p className="font-medium">
                {detail.cycle.startDate} → {detail.cycle.endDate}
              </p>
              <p className="text-muted-foreground">
                Health {detail.cycle.financialHealthScore ?? 0}/100 · Savings{" "}
                {formatPercent(Number(detail.cycle.actualSavingsRate ?? 0))}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Net salary</p>
                <p className="font-semibold tabular-nums">
                  {formatMoney(detail.cycle.netSalary, currency)}
                </p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Variable spent</p>
                <p className="font-semibold tabular-nums">
                  {formatMoney(detail.cycle.totalVariableSpent, currency)}
                </p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Unspent budget</p>
                <p className="font-semibold tabular-nums">
                  {formatMoney(detail.cycle.unspentBudget, currency)}
                </p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Savings shortfall</p>
                <p className="font-semibold tabular-nums text-amber-600">
                  {formatMoney(detail.cycle.savingsShortfall, currency)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Obligations
              </h4>
              <ul className="space-y-1">
                {detail.obligations.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between rounded border px-2 py-1.5"
                  >
                    <span>{o.name}</span>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">{o.status}</Badge>
                      {formatMoney(o.expectedAmount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Transactions ({detail.transactions.length})
              </h4>
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {detail.transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex justify-between rounded border px-2 py-1.5 text-xs"
                  >
                    <span>
                      {tx.description ?? tx.transactionType}
                      {tx.isWastage && (
                        <Badge variant="destructive" className="ml-1.5 text-[10px]">
                          Wastage
                        </Badge>
                      )}
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(tx.amount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
